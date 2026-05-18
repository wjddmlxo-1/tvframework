package tvframework.com.cmm.crypto.impl;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

import tvframework.com.cmm.crypto.CryptoService;
import tvframework.com.cmm.crypto.PasswordEncoder;

/**
 * ARIA 암호화 서비스 구현 클래스
 * EgovARIACryptoServiceImpl을 대체하는 클래스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public class ARIACryptoServiceImpl implements CryptoService {
    
    private PasswordEncoder passwordEncoder;
    private int blockSize = 1024;
    
    /**
     * 비밀번호 인코더를 설정한다.
     * 
     * @param passwordEncoder 비밀번호 인코더
     */
    public void setPasswordEncoder(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }
    
    /**
     * 블록 크기를 설정한다.
     * 
     * @param blockSize 블록 크기
     */
    public void setBlockSize(int blockSize) {
        this.blockSize = blockSize;
    }
    
    @Override
    public byte[] encrypt(byte[] data, String key) throws Exception {
        if (data == null || data.length == 0) {
            return data;
        }
        
        try {
           // 키를 해시하여 32바이트 키 생성 (AES-256)
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = sha.digest(key.getBytes(StandardCharsets.UTF_8));
            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");
            
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            
            return cipher.doFinal(data);
        } catch (Exception e) {
            throw new Exception("암호화 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    @Override
    public byte[] decrypt(byte[] data, String key) throws Exception {
        if (data == null || data.length == 0) {
            return data;
        }
        
        try {
            // 키를 해시하여 32바이트 키 생성 (AES-256)
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = sha.digest(key.getBytes(StandardCharsets.UTF_8));
            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");
            
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            
            return cipher.doFinal(data);
        } catch (Exception e) {
            throw new Exception("복호화 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
}

