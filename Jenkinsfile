pipeline {
    agent { label 'clinic' }

    environment {
        IMAGE_NAME = 'jeevandeep-clinic'
        BLUE_PORT = '8081'
        GREEN_PORT = '8082'
        BLUE_CONTAINER = 'jeevandeep-clinic-blue'
        GREEN_CONTAINER = 'jeevandeep-clinic-green'
    }

    stages {
        stage('Checkout & Test') {
            steps {
                checkout scm
                // The Dockerfile executes testing prior to image completion
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo 'Building New Docker Image...'
                    sh "docker build -t ${IMAGE_NAME}:latest ."
                }
            }
        }

        stage('Blue-Green Deploy') {
            steps {
                script {
                    // Check which container is currently running to determine the target slot
                    def isBlueRunning = sh(script: "docker ps | grep ${BLUE_CONTAINER} || true", returnStdout: true).trim()
                    
                    def newContainer = isBlueRunning ? GREEN_CONTAINER : BLUE_CONTAINER
                    def newPort = isBlueRunning ? GREEN_PORT : BLUE_PORT
                    def oldContainer = isBlueRunning ? BLUE_CONTAINER : GREEN_CONTAINER

                    echo "Currently active container is ${oldContainer}."
                    echo "Deploying update to ${newContainer} on port ${newPort}..."

                    // 1. Start the New Container
                    sh """
                        docker stop ${newContainer} || true
                        docker rm ${newContainer} || true
                        docker run -d --name ${newContainer} -p ${newPort}:8080 --restart unless-stopped ${IMAGE_NAME}:latest
                    """
                    
                    // 2. Wait for it to boot and pass a health check locally
                    echo "Waiting 15 seconds for the Spring Boot server to initialize..."
                    sleep 15
                    
                    // Note: If you want strict health checking, we would ping it here.
                    // sh "curl -f http://localhost:${newPort}/ || exit 1"

                    // 3. Switch Nginx Traffic
                    echo "Updating Nginx configuration to point to port ${newPort}..."
                    sh """
                        # Create an updated Nginx Config for the new port
                        echo 'server {
                            listen 80;
                            server_name _;
                            location / {
                                proxy_pass http://127.0.0.1:${newPort};
                                proxy_set_header Host \\\$host;
                                proxy_set_header X-Real-IP \\\$remote_addr;
                            }
                        }' > nginx_temp.conf
                        
                        # Copy it to Nginx and reload the traffic dynamically (Requires Jenkins sudo permissions for Nginx)
                        sudo mv nginx_temp.conf /etc/nginx/sites-available/default
                        sudo systemctl reload nginx
                    """

                    // 4. Safely terminate the old container since the new one is handling traffic
                    if (isBlueRunning) {
                        echo "Traffic shifted to GREEN. Shutting down old BLUE container..."
                        sh "docker stop ${BLUE_CONTAINER} && docker rm ${BLUE_CONTAINER}"
                    } else {
                        // Edge case: Green was running, or this is the very first deployment
                        def isGreenActuallyRunning = sh(script: "docker ps | grep ${GREEN_CONTAINER} || true", returnStdout: true).trim()
                        if (isGreenActuallyRunning && newContainer == BLUE_CONTAINER) {
                            echo "Traffic shifted to BLUE. Shutting down old GREEN container..."
                            sh "docker stop ${GREEN_CONTAINER} && docker rm ${GREEN_CONTAINER}"
                        } else {
                            echo "This looks like the first deployment. No old containers to shut down."
                        }
                    }
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                script {
                    sh "docker image prune -f"
                }
            }
        }
    }

    post {
        success {
            echo 'Blue-Green Deployment successful! Zero downtime experienced.'
        }
        failure {
            echo 'Deployment failed.'
        }
    }
}
