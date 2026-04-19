package com.jeevandeep.controller;

import com.jeevandeep.model.Review;
import com.jeevandeep.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    // Public endpoint to get all approved reviews for the homepage
    @GetMapping("/public")
    public List<Review> getApprovedReviews() {
        return reviewRepository.findByIsApprovedTrueOrderByCreatedAtDesc();
    }

    // Public endpoint to submit a new review (defaults to unapproved)
    @PostMapping
    public ResponseEntity<Map<String, String>> submitReview(@RequestBody Review review) {
        review.setIsApproved(false);
        reviewRepository.save(review);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Review submitted successfully! It will appear on the site once approved.");
        return ResponseEntity.ok(response);
    }

    // Admin endpoint to get all reviews
    @GetMapping
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    // Admin endpoint to approve a review
    @PutMapping("/{id}/approve")
    public ResponseEntity<Void> approveReview(@PathVariable Long id) {
        return reviewRepository.findById(id).map(review -> {
            review.setIsApproved(true);
            reviewRepository.save(review);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // Admin endpoint to delete a review
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        if (reviewRepository.existsById(id)) {
            reviewRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
