package com.utkarshhh.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private static final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.put(session.getId(), session);
        System.out.println(" WebSocket connected: " + session.getId());
        System.out.println(" Total active connections: " + sessions.size());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        System.out.println(" Received message from client: " + message.getPayload());

    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session.getId());
        System.out.println(" WebSocket disconnected: " + session.getId());
        System.out.println(" Total active connections: " + sessions.size());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        System.err.println(" WebSocket error for session " + session.getId() + ": " + exception.getMessage());
        sessions.remove(session.getId());
    }

    public static void broadcastNotification(String type, String title, String message) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("id", System.currentTimeMillis());
        notification.put("type", type);
        notification.put("title", title);
        notification.put("message", message);
        notification.put("timestamp", System.currentTimeMillis());
        notification.put("read", false);

        ObjectMapper mapper = new ObjectMapper();
        try {
            String jsonMessage = mapper.writeValueAsString(notification);

            System.out.println(" Broadcasting notification to " + sessions.size() + " clients");

            sessions.values().forEach(session -> {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(jsonMessage));
                        System.out.println(" Sent to session: " + session.getId());
                    }
                } catch (IOException e) {
                    System.err.println(" Failed to send to session " + session.getId() + ": " + e.getMessage());
                }
            });
        } catch (Exception e) {
            System.err.println(" Failed to create notification JSON: " + e.getMessage());
            e.printStackTrace();
        }
    }
}