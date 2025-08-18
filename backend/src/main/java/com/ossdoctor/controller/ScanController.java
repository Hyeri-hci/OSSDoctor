package com.ossdoctor.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
public class ScanController {

    // 브라우저/클라이언트에서:
    // GET http://localhost:8080/scan?repoUrl=https://github.com/signalapp/Signal-Desktop
    @GetMapping("/scan")
    public Map<String, Object> scan(@RequestParam(required = false) String repoUrl) {
        Map<String, Object> res = new HashMap<>();
        res.put("ok", true);
        res.put("repoUrl", repoUrl);
        return res;
    }
}
