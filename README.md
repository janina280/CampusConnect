# 🎓 CampusConnect

**CampusConnect** is a real-time communication platform designed for educational environments, enabling seamless interaction between students, tutors, and administrators. The application includes secure authentication, personal and group chat, file sharing, and real-time notifications via WebSocket.

## 📌 Key Features

- ✅ JWT-based authentication and registration
- 👥 One-to-one and group chat functionality
- 📎 Media sharing: images, documents, and links
- 🔔 Real-time messaging using WebSocket (STOMP over SockJS)
- ⭐ Message pinning and starring
- 👤 User profile and group avatar customization
- 🔒 Role-based access control with Spring Security

## 🧰 Technologies Used

### Frontend
- React.js
- Redux (classic, not Toolkit)
- Material UI
- Axios
- WebSocket (SockJS + STOMP)

### Backend
- Java 17
- Spring Boot
- Spring Security (with JWT)
- Spring WebSocket
- Spring Data JPA (Hibernate)
- PostgreSQL
- Maven

## 🧪 Functional Overview

| Feature                  | Description                                                                 |
|--------------------------|-----------------------------------------------------------------------------|
| JWT Authentication       | Protects routes and resources using access & refresh tokens                 |
| Real-time Messaging      | WebSocket connection using STOMP for live communication                     |
| Group Management         | Tutors and admins can create custom chat groups                             |
| Message Persistence      | Messages are stored in the database (text, images, files, links)            |
| Role System              | Users have one of three roles: Student, Tutor, or Admin                     |
| Contact Info Sidebar     | Displays detailed info in 1-1 conversations                                 |

## ⚙️ Configuration Snippet (Backend)

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
   @Override
    public void registerStompEndpoints(StompEndpointRegistry registry){
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry){
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/group", "/user", "/chat");
        registry.setUserDestinationPrefix("/user");
    }
    @Override
    public void configureWebSocketTransport(org.springframework.web.socket.config.annotation.WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(10 * 1024 * 1024);       // 10MB
        registration.setSendBufferSizeLimit(10 * 1024 * 1024);    // 10MB
        registration.setSendTimeLimit(60000);                     // 60 sec

    }
}
```
## 🧱 Project Structure

```plaintext
CampusConnect/
├── campus-connect-server/     # Spring Boot backend (API, DB, WebSocket)
│   └── src/main/java/...
├── campus-connect-client/     # React + Redux frontend
│   └── src/...
├── documentation/             # Documentation files (PDF, diagrams, etc.)
└── README.md
