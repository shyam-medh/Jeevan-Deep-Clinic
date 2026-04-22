package com.jeevandeep.controller;

import com.jeevandeep.model.BlogPost;
import com.jeevandeep.repository.BlogPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blogs")
public class BlogPostController {

    @Autowired
    private BlogPostRepository blogPostRepository;

    @GetMapping
    public List<BlogPost> getAllBlogs() {
        return blogPostRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<BlogPost> createBlog(@RequestBody BlogPost blogPost) {
        BlogPost saved = blogPostRepository.save(blogPost);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlog(@PathVariable Long id) {
        if (!blogPostRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        blogPostRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
