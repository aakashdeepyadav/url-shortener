pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    APP_NAME = 'url-shortener'
    ARTIFACT_DIR = 'dist'

    // ==== REQUIRED: configure these for your AWS/Jenkins setup ====
    // You can either:
    // 1) Replace the CHANGEME values here, OR
    // 2) Set Jenkins environment variables with the same names (recommended)
    AWS_REGION = "${env.AWS_REGION ?: 'CHANGEME'}"
    S3_BUCKET = "${env.S3_BUCKET ?: 'CHANGEME'}"
    SSH_USER = "${env.SSH_USER ?: 'ubuntu'}"
    DEV_HOST = "${env.DEV_HOST ?: 'CHANGEME'}"
    PROD_HOST = "${env.PROD_HOST ?: 'CHANGEME'}"

    // Jenkins Credentials → "SSH Username with private key" (ID can also be set via Jenkins env var)
    SSH_CREDENTIALS_ID = "${env.SSH_CREDENTIALS_ID ?: 'ec2-ssh-key'}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
          bash scripts/package_release.sh ${ARTIFACT_DIR} ${ARTIFACT_NAME}
          env.SAFE_BRANCH_NAME = branchName.replaceAll('[^A-Za-z0-9._-]+', '-')
          env.ARTIFACT_NAME = "${env.APP_NAME}-${env.APP_SEMVER}-${env.SAFE_BRANCH_NAME}-${env.BUILD_NUMBER}.tgz"
        }

        echo "Building ${env.APP_NAME} ${env.APP_VERSION}"
      }
    }

    stage('Install Dependencies') {
      steps {
        sh '''
          set -eu
          node --version
          npm --version
          npm ci
        '''
      }
    }

    stage('Test') {
      steps {
        sh '''
          set -eu
          npm test
        '''
      }
    }

    stage('Package') {
      steps {
        sh '''
          set -eu
          bash scripts/package_release.sh ${ARTIFACT_DIR} ${ARTIFACT_NAME}
        '''
      }
    }

    stage('Upload Artifact to S3 (optional)') {
      when {
        expression {
          return (
            env.S3_BUCKET && env.S3_BUCKET != 'CHANGEME'
            && env.AWS_REGION && env.AWS_REGION != 'CHANGEME'
          )
        }
      }
      steps {
        sh '''
          set -eu
          aws --version
          aws s3 cp ${ARTIFACT_DIR}/${ARTIFACT_NAME} s3://${S3_BUCKET}/artifacts/${APP_NAME}/${BRANCH_NAME}/${BUILD_NUMBER}/${ARTIFACT_NAME} --region ${AWS_REGION}
        '''
      }
    }

    stage('Deploy to EC2') {
      when {
        anyOf { branch 'develop'; branch 'main' }
      }
      steps {
        script {
          if (env.BRANCH_NAME == 'main') {
            env.TARGET_ENV = 'prod'
            env.TARGET_HOST = env.PROD_HOST
          } else {
            env.TARGET_ENV = 'dev'
            env.TARGET_HOST = env.DEV_HOST
          }

          if (!env.TARGET_HOST || env.TARGET_HOST == 'CHANGEME') {
            error('Set DEV_HOST / PROD_HOST (either in Jenkins env vars or in Jenkinsfile) before deploying.')
          }
        }

        sshagent(credentials: [env.SSH_CREDENTIALS_ID]) {
          sh '''
            set -eu
            echo "Deploying ${ARTIFACT_NAME} to ${TARGET_ENV} (${TARGET_HOST})"

            scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${ARTIFACT_DIR}/${ARTIFACT_NAME} ${SSH_USER}@${TARGET_HOST}:/tmp/${ARTIFACT_NAME}
            scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null scripts/deploy_remote.sh ${SSH_USER}@${TARGET_HOST}:/tmp/deploy_remote.sh

            ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${SSH_USER}@${TARGET_HOST} "chmod +x /tmp/deploy_remote.sh && sudo APP_VERSION='${APP_VERSION}' APP_BUILD='${APP_BUILD}' /tmp/deploy_remote.sh /tmp/${ARTIFACT_NAME} ${APP_NAME} ${TARGET_ENV}"
          '''
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'dist/*.tgz', fingerprint: true
    }
  }
}
