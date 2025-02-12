REGION      := $(shell aws configure get region)
ACCOUNT_ID  := $(shell aws sts get-caller-identity --query "Account" --output text)
ECR_REPO    := mqm-scorecard-api
ECR_REGISTRY := $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com
IMAGE_TAG   := latest
SERVICE_NAME := mqm-scorecard-service
CLUSTER_NAME := mqm-scorecard-cluster

.PHONY: push build login deploy

login:
	@aws ecr get-login-password --region $(REGION) | docker login --username AWS --password-stdin $(ECR_REGISTRY)

build: login
	docker build -t $(ECR_REGISTRY)/$(ECR_REPO):$(IMAGE_TAG) .

push: build
	docker push $(ECR_REGISTRY)/$(ECR_REPO):$(IMAGE_TAG)

deploy:
	aws ecs update-service --cluster $(CLUSTER_NAME) --service $(SERVICE_NAME) --force-new-deployment --region $(REGION)
