FROM reactnativecommunity/react-native-android

WORKDIR /app

COPY . .

RUN npm install

WORKDIR /app/android

RUN chmod +x gradlew

RUN ./gradlew assembleRelease