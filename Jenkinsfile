pipeline {
    agent any
    
    environment {
        DOCKER_HUB = credentials('docker-hub-creds')
        IMAGE_NAME = "docker-hub/my-node-app5"
        STAGING_PORT = "8001"
        PRODUCTION_PORT = "8000"
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', 
                url: 'https://github.com/jimmysaqipi/my-node-app.git',
                credentialsId: 'github-ssh' // or use HTTPS
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    junit '**/test-results.xml'
                    publishHTML target: [
                        allowMissing: false,
                        alwaysLinkToLastBuild: false,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'lcov-report/index.html',
                        reportName: 'Jest Coverage Report'
                    ]
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("${IMAGE_NAME}:${env.BUILD_TAG}")
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-creds') {
                        dockerImage.push()
                        dockerImage.push('latest')
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            steps {
                sh """
                docker stop node-staging || true
                docker rm node-staging || true
                docker run -d \
                  -p ${STAGING_PORT}:8000 \
                  --name node-staging \
                  ${IMAGE_NAME}:${env.BUILD_TAG}
                """
            }
        }
        
        stage('Approval') {
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    input message: 'Deploy to production?', ok: 'Deploy'
                }
            }
        }
        
        stage('Deploy to Production') {
            steps {
                sh """
                docker stop node-prod || true
                docker rm node-prod || true
                docker run -d \
                  -p ${PRODUCTION_PORT}:8000 \
                  --name node-prod \
                  ${IMAGE_NAME}:${env.BUILD_TAG}
                """
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        failure {
            slackSend channel: '#ci-alerts',
                     message: "Build ${env.BUILD_NUMBER} failed: ${env.BUILD_URL}"
        }
    }
}
