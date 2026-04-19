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

                    // 1. Start the New Container
                    sh """
                        docker stop ${newContainer} || true
                        docker rm   ${newContainer} || true
                        docker run -d --name ${newContainer} -p ${newPort}:8080 --restart unless-stopped ${IMAGE_NAME}:latest
                    """

                    // 2. Wait for Spring Boot to boot
                    echo 'Waiting 15 seconds for the server to initialize...'
                    sleep 15

                    // 3. Switch Nginx traffic to the new container
                    echo "Switching Nginx traffic to port ${newPort}..."
                    sh """
                        echo 'server {
                            listen 80;
                            server_name _;
                            location / {
                                proxy_pass http://127.0.0.1:${newPort};
                                proxy_set_header Host \\\$host;
                                proxy_set_header X-Real-IP \\\$remote_addr;
                                proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
                                proxy_set_header X-Forwarded-Proto \\\$scheme;
                            }
                        }' > nginx_temp.conf
                        sudo mv nginx_temp.conf /etc/nginx/sites-available/default
                        sudo systemctl reload nginx
                    """

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
                sh 'docker image prune -f'
            }
        }
    }

    post {
        success { echo '✅ Blue-Green Deployment successful! Zero downtime.' }
        failure { echo '❌ Deployment failed. Check the logs above.' }
    }
}

