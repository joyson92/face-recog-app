FROM reactnativecommunity/react-native-android

WORKDIR /app

# Copy only package files first (better caching)
COPY package.json package-lock.json ./

RUN npm install

# Copy rest of project
COPY . .

WORKDIR /app/android

RUN chmod +x gradlew

# Clean previous builds
RUN ./gradlew clean

RUN ./gradlew assembleRelease