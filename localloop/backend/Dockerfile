# Stage 1: Use the official Ballerina runtime image as a base.
# This image already has Java and the necessary Ballerina runtime.
#FROM ballerina/ballerina-runtime:latest
FROM eclipse-temurin:21-jre-alpine

# Set the working directory inside the container.
WORKDIR /home/ballerina

# Copy the executable .jar file from your computer into the container.
# The name "localloop.jar" must match the file in your target/bin/ directory.
COPY target/bin/localloop.jar .

# Tell Docker that the application inside the container will listen on port 8080.
EXPOSE 8080

# The command to run when the container starts.
# This is the same as running "java -jar localloop.jar" from the command line.
CMD ["java", "-jar", "localloop.jar"]