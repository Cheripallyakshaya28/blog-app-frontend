package com.blogapp.controller;

import com.blogapp.exception.ApiException;
import com.blogapp.model.Article;
import com.blogapp.model.Comment;
import com.blogapp.repository.ArticleRepository;
import com.blogapp.security.AuthInterceptor;
import com.blogapp.security.AuthUser;
import com.blogapp.security.JwtService;
import com.blogapp.security.RequireRole;
import com.blogapp.service.ArticleViewService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/** Reading articles + commenting  (was UserAPI.js, mounted at /user-api) */
@RestController
@RequestMapping("/user-api")
public class UserController {

    public record CommentRequest(Long articleId, String comment) {}

    private final ArticleRepository articleRepository;
    private final ArticleViewService views;
    private final JwtService jwtService;

    public UserController(ArticleRepository articleRepository, ArticleViewService views, JwtService jwtService) {
        this.articleRepository = articleRepository;
        this.views = views;
        this.jwtService = jwtService;
    }

    // GET ARTICLES (PUBLIC)
    @GetMapping("/articles")
    public ResponseEntity<Map<String, Object>> getArticles() {
        return ResponseEntity.ok(Responses.of("articles", views.toViews(articleRepository.findAllActive())));
    }

    // GET ONE ARTICLE (used when the article page is opened directly / refreshed)
    @GetMapping("/article/{id}")
    public ResponseEntity<Map<String, Object>> getArticle(@PathVariable("id") Long id, HttpServletRequest request) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Article not found"));
        if (Boolean.FALSE.equals(article.getIsArticleActive())) {
            // deleted (soft) articles are visible only to their author or an admin
            AuthUser viewer = jwtService.optionalUser(request).orElse(null);
            boolean allowed = viewer != null
                    && ("ADMIN".equals(viewer.role()) || viewer.id().equals(article.getAuthor()));
            if (!allowed) {
                throw new ApiException(HttpStatus.NOT_FOUND, "Article not found");
            }
        }
        return ResponseEntity.ok(Responses.of("article", views.toView(article)));
    }

    // ADD COMMENT
    @PutMapping("/articles")
    @Transactional
    @RequireRole({"USER", "AUTHOR", "ADMIN"})
    public ResponseEntity<Map<String, Object>> addComment(
            @RequestAttribute(AuthInterceptor.USER_ATTR) AuthUser user,
            @RequestBody CommentRequest req) {
        if (req.articleId() == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Article not found");
        }
        if (Responses.blank(req.comment())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Enter a comment");
        }
        Article article = articleRepository.findById(req.articleId())
                .filter(a -> !Boolean.FALSE.equals(a.getIsArticleActive()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Article not found"));

        Comment comment = new Comment();
        comment.setUser(user.id());
        comment.setComment(req.comment());
        comment.setCreatedAt(Instant.now());
        article.addComment(comment);
        article.setUpdatedAt(Instant.now());
        articleRepository.save(article);

        return ResponseEntity.ok(Responses.of("Comment added successfully", views.toView(article)));
    }
}
