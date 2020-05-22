package com.nttdata.splunknotificationservice.service;

import com.nttdata.splunknotificationservice.splunk.models.SplunkAlert;
import com.nttdata.splunknotificationservice.splunk.models.SplunkWebHookParams;
import com.google.gson.Gson;

import java.util.Base64;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class WebHookServiceImpl implements WebHookService {
    Logger logger = LoggerFactory.getLogger(WebHookServiceImpl.class);

    @Autowired
    ChannelServiceFactory channelServiceFactory;

    public ResponseEntity<String> postMessage(SplunkAlert splunkAlert, String routes) {
        Gson gson = new Gson();
        byte[] decodedRoutesBytes = Base64.getUrlDecoder().decode(routes);
        String decodedRoutesUrl = new String(decodedRoutesBytes);

        SplunkWebHookParams splunkWebHookParams = gson.fromJson(decodedRoutesUrl, SplunkWebHookParams.class);

        splunkWebHookParams.getSplunkWebHookUrls().stream().forEach(splunkWebHookUrls -> {

            Optional<ChannelService> channelService = channelServiceFactory.getChanelService(splunkWebHookUrls.getChatApp());

            channelService.ifPresent(service -> {
                post(splunkWebHookUrls.getUrl(), service.generatePayload(splunkAlert));
            });

        });

        return new ResponseEntity<>("Success", HttpStatus.CREATED);
    }

    private void post(String url, Object postObj) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String res = restTemplate.postForObject(url, postObj, String.class);
            logger.info(res);
        } catch (Exception e) {
            logger.error("Exception in post", e);
        }
    }
}