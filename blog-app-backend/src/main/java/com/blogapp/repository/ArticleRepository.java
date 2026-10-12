package com.blogapp.repository;

import com.blogapp.model.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    @Query("select a from Article a where a.isArticleActive = true order by a.id")
    List<Article> findAllActive();

    @Query("select a from Article a order by a.id")
    List<Article> findAllOrdered();

    @Query("select a from Article a where a.author = :author order by a.id")
    List<Article> findByAuthor(@Param("author") Long author);

    @Query("select a from Article a where a.id = :id and a.author = :author")
    Optional<Article> findByIdAndAuthor(@Param("id") Long id, @Param("author") Long author);
}
