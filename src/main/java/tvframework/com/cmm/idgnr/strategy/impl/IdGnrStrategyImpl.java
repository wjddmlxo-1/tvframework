package tvframework.com.cmm.idgnr.strategy.impl;

import tvframework.com.cmm.idgnr.strategy.IdGnrStrategy;

/**
 * ID 생성 전략 구현 클래스
 * EgovIdGnrStrategyImpl을 대체하는 클래스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public class IdGnrStrategyImpl implements IdGnrStrategy {
    
    private String prefix = "";
    private int cipers = 0;
    private char fillChar = '0';
    
    /**
     * 접두사를 설정한다.
     * 
     * @param prefix 접두사
     */
    public void setPrefix(String prefix) {
        this.prefix = prefix != null ? prefix : "";
    }
    
    /**
     * 자릿수를 설정한다.
     * 
     * @param cipers 자릿수
     */
    public void setCipers(int cipers) {
        this.cipers = cipers;
    }
    
    /**
     * 채움 문자를 설정한다.
     * 
     * @param fillChar 채움 문자
     */
    public void setFillChar(char fillChar) {
        this.fillChar = fillChar;
    }
    
    @Override
    public String makeId(String originalId) {
        if (originalId == null) {
            originalId = "0";
        }
        
        long id = Long.parseLong(originalId);
        String idStr = String.valueOf(id);
        
        // 자릿수에 맞게 패딩
        if (cipers > 0 && idStr.length() < cipers) {
            StringBuilder sb = new StringBuilder();
            for (int i = idStr.length(); i < cipers; i++) {
                sb.append(fillChar);
            }
            sb.append(idStr);
            idStr = sb.toString();
        }
        
        return prefix + idStr;
    }
}

