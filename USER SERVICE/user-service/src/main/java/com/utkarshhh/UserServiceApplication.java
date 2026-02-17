package com.utkarshhh;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;

@SpringBootApplication
public class UserServiceApplication {

	public static void main(String[] args) {
		ApplicationContext ctx = SpringApplication.run(UserServiceApplication.class, args);

		System.out.println(" REGISTERED CONTROLLERS:");
		Arrays.stream(ctx.getBeanDefinitionNames())
				.filter(name -> name.toLowerCase().contains("controller"))
				.forEach(name -> System.out.println(name));
	}
}