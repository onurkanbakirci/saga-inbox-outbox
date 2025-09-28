# Use the official .NET 10 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["SagaStateMachine.Notification.API/SagaStateMachine.Notification.API.csproj", "SagaStateMachine.Notification.API/"]
COPY ["SagaStateMachine.BuildingBlocks/SagaStateMachine.BuildingBlocks.csproj", "SagaStateMachine.BuildingBlocks/"]
RUN dotnet restore "SagaStateMachine.Notification.API/SagaStateMachine.Notification.API.csproj"

# Copy the rest of the source code
COPY . .
WORKDIR "/src/SagaStateMachine.Notification.API"

# Build the application
RUN dotnet build "SagaStateMachine.Notification.API.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "SagaStateMachine.Notification.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the official .NET 10 runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Copy the published application
COPY --from=publish /app/publish .

# Set the entry point
ENTRYPOINT ["dotnet", "SagaStateMachine.Notification.API.dll"]
