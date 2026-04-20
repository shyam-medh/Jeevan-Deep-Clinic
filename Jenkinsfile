pipeline {
    agent { label 'clinic' }

    environment {
        // The ID you gave your Docker credentials in Jenkins
        DOCKER_HUB_CREDENTIALS = credentials('dockerHubCred')
        // Replace 'yourusername' with your actual Docker Hub username
        DOCKER_HUB_USERNAME    = 'shyammedh'
        IMAGE_NAME             = "${DOCKER_HUB_USERNAME}/jeevandeep-clinic"
        BLUE_PORT              = '8081'
        GREEN_PORT             = '8082'
        BLUE_CONTAINER         = 'jeevandeep-clinic-blue'
        GREEN_CONTAINER        = 'jeevandeep-clinic-green'
        
        // Database credentials (must match docker-compose.yml)
        DB_HOST                = 'clinic-db'
        DB_NAME                = 'clinic_db'
        DB_USER                = 'root'
        DB_PASS                = 'password'
        NETWORK_NAME           = 'mkt-project_clinic-network' 
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo 'Building Docker Image...'
                    sh "docker build -t ${IMAGE_NAME}:latest ."
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    echo 'Pushing image to Docker Hub...'
                    sh """
                        echo ${DOCKER_HUB_CREDENTIALS_PSW} | docker login -u ${DOCKER_HUB_CREDENTIALS_USR} --password-stdin
                        docker push ${IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('Ensure Infrastructure') {
            steps {
                script {
                    echo 'Checking Docker Network...'
                    sh "docker network inspect ${NETWORK_NAME} >/dev/null 2>&1 || docker network create ${NETWORK_NAME}"
                    
                    echo 'Ensuring MySQL Database is running...'
                    def isDbRunning = sh(script: "docker ps | grep ${DB_HOST} || true", returnStdout: true).trim()
                    if (!isDbRunning) {
                        echo 'Starting fresh MySQL container...'
                        sh """
                            docker run -d --name ${DB_HOST} \
                                --network ${NETWORK_NAME} \
                                --restart unless-stopped \
                                -v clinic-data:/var/lib/mysql \
                                -e MYSQL_DATABASE=${DB_NAME} \
                                -e MYSQL_ROOT_PASSWORD=${DB_PASS} \
                                mysql:8.0
                        """
                    } else {
                        echo 'MySQL container already running.'
                    }
                }
            }
        }

        stage('Blue-Green Deploy') {
            steps {
                script {
                    // Pull the freshly pushed image from Docker Hub
                    sh "docker pull ${IMAGE_NAME}:latest"

                    // Check which container is currently running
                    def isBlueRunning = sh(script: "docker ps | grep ${BLUE_CONTAINER} || true", returnStdout: true).trim()

                    def newContainer = isBlueRunning ? GREEN_CONTAINER : BLUE_CONTAINER
                    def newPort      = isBlueRunning ? GREEN_PORT : BLUE_PORT
                    def oldContainer = isBlueRunning ? BLUE_CONTAINER : GREEN_CONTAINER

                    echo "Currently active: ${oldContainer}. Deploying to ${newContainer} on port ${newPort}..."

                    // 1. Start the New Container (Connected to DB network)
                    sh """
                        docker stop ${newContainer} || true
                        docker rm   ${newContainer} || true
                        docker run -d --name ${newContainer} \
                            -p ${newPort}:8080 \
                            --network ${NETWORK_NAME} \
                            -e SPRING_PROFILES_ACTIVE=mysql \
                            -e DB_HOST=${DB_HOST} \
                            -e DB_NAME=${DB_NAME} \
                            -e DB_USER=${DB_USER} \
                            -e DB_PASSWORD=${DB_PASS} \
                            --restart unless-stopped \
                            ${IMAGE_NAME}:latest
                    """

                    // 2. Wait for Spring Boot to boot (Smart Health Check)
                    echo "Waiting for ${newContainer} to become healthy..."
                    def isHealthy = false
                    def timeout = 60 // 60 seconds max
                    while (timeout > 0) {
                        def status = sh(script: "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:${newPort}/actuator/health || true", returnStdout: true).trim()
                        if (status == "200") {
                            echo "✅ Container is healthy!"
                            isHealthy = true
                            break
                        }
                        echo "Waiting... (${timeout}s remaining)"
                        sleep 2
                        timeout -= 2
                    }

                    if (!isHealthy) {
                        echo "❌ Container failed to become healthy. Aborting deployment."
                        sh "docker stop ${newContainer} && docker rm ${newContainer}"
                        error "Deployment failed: Health check timeout"
                    }

                    // 3. Switch Nginx traffic to the new container
                    echo "Switching Nginx traffic to port ${newPort}..."
                    sh '''
                        cat > nginx_temp.conf <<'NGINXEOF'
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:NEWPORT;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXEOF
                        sudo mv nginx_temp.conf /etc/nginx/sites-available/default
                        sudo nginx -t && sudo systemctl reload nginx
                    '''.replace('NEWPORT', newPort)

                    // 4. Stop the old container
                    if (isBlueRunning) {
                        echo 'Traffic shifted to GREEN. Stopping old BLUE container...'
                        sh "docker stop ${BLUE_CONTAINER} && docker rm ${BLUE_CONTAINER}"
                    } else {
                        def isGreenActuallyRunning = sh(script: "docker ps | grep ${GREEN_CONTAINER} || true", returnStdout: true).trim()
                        if (isGreenActuallyRunning && newContainer == BLUE_CONTAINER) {
                            echo 'Traffic shifted to BLUE. Stopping old GREEN container...'
                            sh "docker stop ${GREEN_CONTAINER} && docker rm ${GREEN_CONTAINER}"
                        } else {
                            echo 'First deployment — no old containers to stop.'
                        }
                    }
                }
            }
        }

        stage('Cleanup') {
            steps {
                echo 'Cleaning up old images...'
                sh 'docker image prune -af --filter "until=24h"'
            }
        }
    }

    post {
        success { echo '✅ Blue-Green Deployment successful! Zero downtime.' }
        failure { echo '❌ Deployment failed. Check the logs above.' }
    }
}

