package com.example.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter implements GatewayFilter, Ordered {
    private final WebClient webClient;

        
    public AuthenticationFilter(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://localhost:3000").build();
    }

    public static String processPath(String path) {
        // Check if path contains "products" and starts with "/api"
        if (path != null && path.contains("products") && path.startsWith("/api")) {
            // Remove "/api" from the beginning
            return path.substring(4);
        }
        return path;
    }

    @Override
public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String path = exchange.getRequest().getPath().toString();

    // Only validate /api/orders/** and /api/products/**
    if (path.startsWith("/api/orders") || path.startsWith("/api/products") || path.startsWith("/api/reviews")) {
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("Missing Authorization header");
            exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);
        System.out.println("Path: " + path);
        return webClient
            .get()
            .uri("/auth/validate")
            .header("Authorization", "Bearer " + token)
            .retrieve()
            .bodyToMono(AuthValidationResponse.class)
            .flatMap(response -> {
                System.out.println("response: " + response.getId());
                if (response != null && response.isValid()) {
                    // Mutate the request to add the user-id header
                    ServerWebExchange mutatedExchange = exchange.mutate()
                        .request(builder -> builder.header("user-id", response.getId()))
                        .build();
                    return chain.filter(mutatedExchange);
                } else {
                    exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
                    return exchange.getResponse().setComplete();
                }
            })
            .onErrorResume(error -> {
                exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            });
    }

    return chain.filter(exchange);
  }
    @Override
    public int getOrder() {
        return -1;
    }

}
