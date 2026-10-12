package com.blogapp.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import org.hibernate.annotations.BatchSize;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** MySQL table: articles */
@Entity
@Table(name = "articles")
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** id of the author (a user with role AUTHOR) */
    @Column(name = "author_id", nullable = false)
    private Long author;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("id ASC")
    @BatchSize(size = 50)
    private List<Comment> comments = new ArrayList<>();

    @Column(nullable = false)
    private Boolean isArticleActive = true;

    private Instant createdAt;
    private Instant updatedAt;

    public void addComment(Comment c) {
        c.setArticle(this);
        comments.add(c);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAuthor() { return author; }
    public void setAuthor(Long author) { this.author = author; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }

    public Boolean getIsArticleActive() { return isArticleActive; }
    public void setIsArticleActive(Boolean isArticleActive) { this.isArticleActive = isArticleActive; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
