package com.jeevandeep.controller;

import com.jeevandeep.model.Question;
import com.jeevandeep.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    @Autowired
    private QuestionRepository questionRepository;

    // Public: get all answered + displayed questions for the FAQ section
    @GetMapping("/public")
    public List<Question> getPublicQA() {
        return questionRepository.findByIsDisplayedTrueAndAnswerTextNotNullOrderByCreatedAtDesc();
    }

    // Public: patient submits a question
    @PostMapping
    public ResponseEntity<Map<String, String>> submitQuestion(@RequestBody Question question) {
        question.setIsDisplayed(false);
        question.setAnswerText(null);
        questionRepository.save(question);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Your question has been submitted! The doctor will answer it soon.");
        return ResponseEntity.ok(response);
    }

    // Admin: get all questions
    @GetMapping
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    // Admin: answer a question
    @PutMapping("/{id}/answer")
    public ResponseEntity<Void> answerQuestion(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return questionRepository.findById(id).map(q -> {
            q.setAnswerText(body.get("answerText"));
            questionRepository.save(q);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // Admin: toggle display on/off
    @PutMapping("/{id}/toggle-display")
    public ResponseEntity<Void> toggleDisplay(@PathVariable Long id) {
        return questionRepository.findById(id).map(q -> {
            q.setIsDisplayed(!q.getIsDisplayed());
            questionRepository.save(q);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // Admin: delete a question
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        if (questionRepository.existsById(id)) {
            questionRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
