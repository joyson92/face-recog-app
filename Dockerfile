FROM openjdk:17-jdk-slim

ENV ANDROID_SDK_ROOT=/sdk
ENV PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools

RUN apt-get update && apt-get install -y \
    wget unzip git

RUN mkdir -p $ANDROID_SDK_ROOT

WORKDIR /workspace
