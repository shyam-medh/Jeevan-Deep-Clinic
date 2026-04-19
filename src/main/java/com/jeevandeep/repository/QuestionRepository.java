package com.jeevandeep.repository;

import com.jeevandeep.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByIsDisplayedTrueAndAnswerTextNotNullOrderByCreatedAtDesc();
}
