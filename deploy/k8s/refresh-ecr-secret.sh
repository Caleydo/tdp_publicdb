#!/bin/bash

set -o pipefail
set -o errtrace
set -o errexit

ACCOUNT=922145058410
REGION=eu-central-1
SECRET_NAME=ordino-${REGION}-ecr-registry
EMAIL=ITCompBio@boehringer-ingelheim.com

#
# Fetch token (which will expire in 12 hours)
#
echo fetch token
TOKEN=`aws ecr --region=$REGION get-authorization-token --output text --query authorizationData[].authorizationToken | base64 -d | cut -d: -f2`

echo fetched token
#
# Create or repleace registry secret
#

kubectl --kubeconfig ./admin.conf delete secret --ignore-not-found $SECRET_NAME
kubectl --kubeconfig ./admin.conf create secret docker-registry $SECRET_NAME \
 --docker-server=https://${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com \
 --docker-username=AWS \
 --docker-password="${TOKEN}" \
 --docker-email="${EMAIL}"

# end
