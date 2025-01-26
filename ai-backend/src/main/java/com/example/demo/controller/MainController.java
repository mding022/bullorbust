package com.example.demo.controller;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.NewsService;
import com.example.demo.service.StockService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class MainController {
    private final StockService stockService;
    private final NewsService newsService;
    private final String[] stocks = { "The Gold Mining Company of Canada", "National Canadian Crude Oil Index",
            "Union of Canadian National Farmers", "Canadian Fisheries Company Inc.", "Canadian Real Estate Composite",
            "Military Defense Solutions Canada" };

    public MainController(StockService stockService, NewsService newsService) {
        this.stockService = stockService;
        this.newsService = newsService;
    }

    @GetMapping("/stocks")
    public Map<String, Double> getStocks() {
        return stockService.getPrices();
    }

    @GetMapping("/stock")
    public double getStock(@RequestParam String ticker) {
        return stockService.getPrices().get(ticker);
    }

    @GetMapping("/news")
    public List<String> newsFeed() {
        return newsService.getNewsFeed();
    }

    @GetMapping("/gpt")
    public String getGPT(@RequestParam("ticker") int ticker, @RequestParam("type") int type) {
        System.out.println(stocks[ticker]);
        String prompt = "";
        switch (type) {
            case 0:
                prompt = "Tone: Positive and credible. Structure: Clear, valid claims about actual growth, progress, or success. The headline highlights real accomplishments and verified positive news. Following those steps, write a one to two sentence sample headline of the company "
                        + stocks[ticker] + ". Only return the headline and nothing else as a string.";
                break;
            case 1:
                prompt = "Tone: Neutral and factual. Structure: The headline reports on planned actions or exploratory discussions without making a clear prediction about the future. It may mention future possibilities but remains non-committal, offering neither strong positive nor negative signals.  Following those steps, write a one to two sentence sample headline of the company "
                        + stocks[ticker] + ". Only return the headline and nothing else as a string.";
                break;
            case 2:
                prompt = "Tone: Exaggerated, urgent, FOMO-driven, fake credibility. Structure: The headline creates a false sense of urgency or exclusivity, often referencing unnamed sources, insider information, or exaggerated future potential. It implies the stock will skyrocket or explode, but there is no solid backing or clear evidence. The stock will jump temporarily due to hype but will eventually fall as the excitement fades.  Following those steps, write a one to two sentence sample headline of the company "
                        + stocks[ticker] + ". Only return the headline and nothing else as a string.";
                break;
            case 3:
                prompt = "Tone: Negative, factual, and credible. Structure: The headline reports on real negative events, such as lawsuits, financial loss, scandals, or product failures, with credible sources or verified information. It gives a clear signal that the stock is likely to decline based on unfavorable developments. Also could be about natural disasters or freak accidents. Please be creative and don;t always use class-action lawsuits. Keywords: Lawsuit, loss, bankruptcy, fraud, recall, scandal, termination, investigation, fines, failure, collapse. Following those steps, write a one to two sentence sample headline of the company  Following those steps, write a one to two sentence sample headline of the company "
                        + stocks[ticker] + ". Only return the headline and nothing else as a string.";
                break;
        }
        newsService.generateAIResponse(prompt);
        switch (type) {
            case 0:
                stockService.realGood(ticker);
                break;
            case 1:
                stockService.neutral(ticker);
                break;
            case 2:
                stockService.pumpDump(ticker);
                break;
            case 3:
                stockService.realBad(ticker);
                break;

        }
        return "Success";
    }

    @Scheduled(fixedRate = 10000)
    public void simulateNews() {
        getGPT((int) (Math.random() * 6), (int) (Math.random() * 4));
    }
}
