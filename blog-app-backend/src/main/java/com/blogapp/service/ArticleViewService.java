package com.blogapp.service;

import com.blogapp.model.Article;
import com.blogapp.model.Comment;
import com.blogapp.model.User;
import com.blogapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Turns Article documents into the JSON the React app expects:
 * "_id" instead of "id", and each comment's "user" filled in with email/name
 * (the frontend shows comment.user.email).
 */
@Service
public class ArticleViewService {

    private final UserRepository userRepository;

    public ArticleViewService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Map<String, Object> toView(Article article) {
        return toViews(List.of(article)).get(0);
    }

    public List<Map<String, Object>> toViews(List<Article> articles) {
        Set<Long> userIds = new HashSet<>();
        for (Article a : articles) {
            if (a.getComments() == null) continue;
            for (Comment c : a.getComments()) {
                if (c.getUser() != null) userIds.add(c.getUser());
            }
        }
        Map<Long, User> users = new HashMap<>();
        if (!userIds.isEmpty()) {
            for (User u : userRepository.findAllById(userIds)) {
                users.put(u.getId(), u);
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Article a : articles) {
            result.add(view(a, users));
        }
        return result;
    }

    private Map<String, Object> view(Article a, Map<Long, User> users) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("_id", a.getId());
        m.put("author", a.getAuthor());
        m.put("title", a.getTitle());
        m.put("category", a.getCategory());
        m.put("content", a.getContent());

        List<Map<String, Object>> comments = new ArrayList<>();
        if (a.getComments() != null) {
            for (Comment c : a.getComments()) {
                Map<String, Object> cm = new LinkedHashMap<>();
                User u = c.getUser() == null ? null : users.get(c.getUser());
                Map<String, Object> um = new LinkedHashMap<>();
                um.put("_id", c.getUser());
                if (u != null) {
                    um.put("email", u.getEmail());
                    um.put("firstName", u.getFirstName());
                    um.put("lastName", u.getLastName());
                }
                cm.put("user", um);
                cm.put("comment", c.getComment());
                cm.put("createdAt", c.getCreatedAt());
                comments.add(cm);
            }
        }
        m.put("comments", comments);
        m.put("isArticleActive", !Boolean.FALSE.equals(a.getIsArticleActive()));
        m.put("createdAt", a.getCreatedAt());
        m.put("updatedAt", a.getUpdatedAt());
        return m;
    }
}
