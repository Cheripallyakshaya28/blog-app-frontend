package com.blogapp.controller;

import com.blogapp.exception.ApiException;
import com.blogapp.model.Article;
import com.blogapp.model.User;
import com.blogapp.repository.ArticleRepository;
import com.blogapp.repository.UserRepository;
import com.blogapp.security.AuthInterceptor;
import com.blogapp.security.AuthUser;
import com.blogapp.security.RequireRole;
import com.blogapp.service.ArticleViewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/** Author's article CRUD  (was AuthorAPI.js, mounted at /author-api) */
@RestController
@RequestMapping("/author-api")
public class AuthorController {

    public record CreateRequest(Long author, String title, String category, String content) {}

    public record EditRequest(Long articleId, String title, String category, String content) {}

    public record StatusRequest(Long articleId, Boolean isArticleActive) {}

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final ArticleViewService views;

    public AuthorController(ArticleRepository articleRepository, UserRepository userRepository,
                            ArticleViewService views) {
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
        this.views = views;
    }

    // WRITE ARTICLE
    @PostMapping("/article")
    @RequireRole("AUTHOR")
    public ResponseEntity<Map<String, Object>> createArticle(
            @RequestAttribute(AuthInterceptor.USER_ATTR) AuthUser user,
            @RequestBody CreateRequest req) {
        if (req.author() == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Invalid author");
        }
        User author = userRepository.findById(req.author())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invalid author"));
        if (!author.getEmail().equals(user.email())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorized");
        }
        if (Responses.blank(req.title())) throw ApiException.validation("Title is required");
        if (Responses.blank(req.category())) throw ApiException.validation("Category is required");
        if (Responses.blank(req.content())) throw ApiException.validation("Content is required");

        Article article = new Article();
        article.setAuthor(author.getId());
        article.setTitle(req.title());
        article.setCategory(req.category());
        article.setContent(req.content());
        article.setIsArticleActive(true);
        article.setCreatedAt(Instant.now());
        article.setUpdatedAt(Instant.now());
        articleRepository.save(article);

        return ResponseEntity.status(HttpStatus.CREATED).body(Responses.of("Article published successfully"));
    }

    // READ OWN ARTICLES
    @GetMapping("/articles")
    @RequireRole("AUTHOR")
    public ResponseEntity<Map<String, Object>> ownArticles(
            @RequestAttribute(AuthInterceptor.USER_ATTR) AuthUser user) {
        return ResponseEntity.ok(Responses.of("articles", views.toViews(articleRepository.findByAuthor(user.id()))));
    }

    // EDIT ARTICLE
    @PutMapping("/articles")
    @Transactional
    @RequireRole("AUTHOR")
    public ResponseEntity<Map<String, Object>> editArticle(
            @RequestAttribute(AuthInterceptor.USER_ATTR) AuthUser user,
            @RequestBody EditRequest req) {
        if (req.articleId() == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not authorized to edit article");
        }
        Article article = articleRepository.findByIdAndAuthor(req.articleId(), user.id())
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Not authorized to edit article"));
        if (req.title() != null) article.setTitle(req.title());
        if (req.category() != null) article.setCategory(req.category());
        if (req.content() != null) article.setContent(req.content());
        article.setUpdatedAt(Instant.now());
        articleRepository.save(article);
        return ResponseEntity.ok(Responses.of("Article modified", views.toView(article)));
    }

    // DELETE / RESTORE ARTICLE (soft delete)
    @PatchMapping("/articles")
    @Transactional
    @RequireRole("AUTHOR")
    public ResponseEntity<Map<String, Object>> changeStatus(
            @RequestAttribute(AuthInterceptor.USER_ATTR) AuthUser user,
            @RequestBody StatusRequest req) {
        if (req.articleId() == null || req.isArticleActive() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "articleId and isArticleActive are required");
        }
        Article article = articleRepository.findByIdAndAuthor(req.articleId(), user.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Article not found"));

        if (req.isArticleActive().equals(article.getIsArticleActive())) {
            return ResponseEntity.ok(Responses.of("Article already in the same state", views.toView(article)));
        }
        article.setIsArticleActive(req.isArticleActive());
        article.setUpdatedAt(Instant.now());
        articleRepository.save(article);
        return ResponseEntity.ok(Responses.of("Article modified", views.toView(article)));
    }
}
