package com.example.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

@Service
public class StockService {
    private final String[] stocks = {"GLD", "CRUDE", "FARMRS", "FISHRS", "HOUSES", "MLTRY"};
    private final double[] prices = {2050, 1000, 580, 480, 1300, 950};
    private final Random random = new Random();

    @Scheduled(fixedRate = 100)
    public void updateStockPrices() {
        for (int i = 0; i < prices.length; i++) {
            double changeFactor = random.nextDouble();
            double changeAmount = (changeFactor < 0.3 ? -random.nextDouble() * 3 : random.nextDouble() * 2);
            prices[i] = Math.max(0, Math.round((prices[i] + changeAmount) * 100.0) / 100.0); // Ensures non-negative prices
        }
    }

    public void modifyStock(int stock, double amt) {
        prices[stock] += amt;
    }

    public void realGood(int stock) {
        Random rand = new Random();
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        double firstJumpFactor = 1 + (0.15 + rand.nextDouble() * 0.15); 
        prices[stock] *= firstJumpFactor;

        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        double secondJumpFactor = 1 + (0.05 + rand.nextDouble() * 0.10);
        prices[stock] *= secondJumpFactor;
    }

    public void pumpDump(int stock) {
        Random rand = new Random();
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        double initialFactor = 1 + (0.1 + rand.nextDouble() * 0.10); 
        prices[stock] *= initialFactor;
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        double fallFactor = 1 - (0.1 + rand.nextDouble() * 0.10); 
        prices[stock] *= fallFactor;
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        double secondFallFactor = 1 - (0.06 + rand.nextDouble() * 0.10); 
        prices[stock] *= secondFallFactor;
    }

    public void realBad(int stock) {
        Random rand = new Random();
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        double firstDropFactor = 1 - (0.10 + rand.nextDouble() * 0.10);
        prices[stock] *= firstDropFactor;

        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        double secondDropFactor = 1 - (0.05 + rand.nextDouble() * 0.10);
        prices[stock] *= secondDropFactor;
    }

    public void neutral(int stock) {
        Random rand = new Random();
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        double factor = 1 + (rand.nextDouble() * 0.05 - 0.025); 
        prices[stock] *= factor;
    }




    public Map<String, Double> getPrices() {
        Map<String, Double> stockPrices = new HashMap<>();
        for (int i = 0; i < stocks.length; i++) {
            stockPrices.put(stocks[i], prices[i]);
        }
        return stockPrices;
    }
}
