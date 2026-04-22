package com.jeevandeep.config;

import com.jeevandeep.model.BlogPost;
import com.jeevandeep.repository.BlogPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Override
    public void run(String... args) throws Exception {
        if (blogPostRepository.count() == 0) {
            blogPostRepository.save(new BlogPost(
                "The Ecosystem of Your Mouth: A Microscopic World",
                "Oral Biology",
                "Discover the fascinating balance of good and bad bacteria in your mouth, and how saliva acts as your natural defense system.",
                "Your mouth is home to billions of bacteria forming a complex ecosystem known as the oral microbiome. Most of these microbes are harmless or even beneficial, aiding in digestion and protecting against pathogens. However, when the balance is disrupted by a high-sugar diet or poor hygiene, harmful bacteria multiply, forming plaque. These bacteria produce acids that attack tooth enamel, leading to cavities. Saliva is your body's natural defense, constantly washing away food particles and neutralizing acids. Understanding this delicate biological balance is the first step to lifelong oral health.",
                "https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ));

            blogPostRepository.save(new BlogPost(
                "The Anatomy of a Tooth: Beyond the Surface",
                "Anatomy",
                "A tooth is more than just a hard shell. Learn about the complex layers from enamel to pulp that keep your smile alive.",
                "A healthy tooth consists of several distinct biological layers. The outermost layer, Enamel, is the hardest substance in the human body, protecting the inner structures. Beneath it lies Dentin, a porous, yellowish tissue containing microscopic tubules that transmit sensations. At the very core is the Dental Pulp, the living heart of the tooth, containing nerves, blood vessels, and connective tissue. Finally, Cementum covers the tooth root, anchoring it securely to the jawbone. When decay breaches the enamel and dentin, it reaches the pulp, causing severe pain and necessitating treatments like root canals to save the tooth.",
                "https://images.unsplash.com/photo-1598256989800-fea5ce5146ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ));

            blogPostRepository.save(new BlogPost(
                "The Systemic Link: How Oral Health Impacts Your Body",
                "Systemic Health",
                "Did you know gum disease is linked to heart disease? Uncover the profound connection between your mouth and your overall well-being.",
                "The mouth is the gateway to the rest of your body, and your oral health offers vital clues about your overall health. Studies have shown a strong systemic link between periodontal (gum) disease and serious health conditions, including cardiovascular disease, diabetes, and respiratory infections. The inflammation caused by severe gum disease allows bacteria to enter the bloodstream, potentially contributing to plaque buildup in arteries. Maintaining pristine oral hygiene is not just about preventing cavities; it's a critical component of your holistic health strategy.",
                "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ));

            blogPostRepository.save(new BlogPost(
                "The Science of Cavities: Demineralization Explained",
                "Preventive Care",
                "Explore the chemical process of tooth decay, how pH levels fluctuate, and the remineralizing power of fluoride.",
                "Tooth decay is fundamentally a chemical process known as demineralization. Every time you consume carbohydrates, the bacteria in your plaque produce acids, causing the pH level in your mouth to drop. When the pH drops below 5.5, the acid begins to dissolve the calcium and phosphate minerals in your tooth enamel. Fortunately, this process can be reversed through remineralization. Fluoride, found in toothpaste and drinking water, plays a crucial role by integrating into the enamel structure, creating fluorapatite, which is significantly more resistant to acid attacks. Regular brushing and professional fluoride treatments tip the scales in favor of remineralization.",
                "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ));
        }
    }
}
