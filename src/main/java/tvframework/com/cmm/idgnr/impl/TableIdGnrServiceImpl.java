package tvframework.com.cmm.idgnr.impl;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.sql.DataSource;

import tvframework.com.cmm.idgnr.IdGnrService;
import tvframework.com.cmm.idgnr.strategy.IdGnrStrategy;

/**
 * 테이블 기반 ID 생성 서비스 구현 클래스
 * EgovTableIdGnrServiceImpl을 대체하는 클래스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public class TableIdGnrServiceImpl implements IdGnrService {
    
    private DataSource dataSource;
    private String table = "CM_IDS";
    private String tableName;
    private int blockSize = 10;
    private IdGnrStrategy strategy;
    
    /**
     * DataSource를 설정한다.
     * 
     * @param dataSource DataSource
     */
    public void setDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    /**
     * 테이블명을 설정한다.
     * 
     * @param table 테이블명
     */
    public void setTable(String table) {
        this.table = table;
    }
    
    /**
     * 테이블 컬럼명을 설정한다.
     * 
     * @param tableName 테이블 컬럼명
     */
    public void setTableName(String tableName) {
        this.tableName = tableName;
    }
    
    /**
     * 블록 크기를 설정한다.
     * 
     * @param blockSize 블록 크기
     */
    public void setBlockSize(int blockSize) {
        this.blockSize = blockSize;
    }
    
    /**
     * 전략을 설정한다.
     * 
     * @param strategy 전략
     */
    public void setStrategy(IdGnrStrategy strategy) {
        this.strategy = strategy;
    }
    
    @Override
    public String getNextStringId() throws Exception {
        long nextId = getNextLongId();
        if (strategy != null) {
            return strategy.makeId(String.valueOf(nextId));
        }
        return String.valueOf(nextId);
    }
    
    @Override
    public long getNextLongId() throws Exception {
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        
        try {
            conn = dataSource.getConnection();
            conn.setAutoCommit(false);
            
            // 현재 값 조회 및 업데이트
            String selectSql = "SELECT NEXT_ID FROM " + table + " WHERE TABLE_NAME = ? FOR UPDATE";
            pstmt = conn.prepareStatement(selectSql);
            pstmt.setString(1, tableName);
            rs = pstmt.executeQuery();
            
            long currentId;
            if (rs.next()) {
                currentId = rs.getLong("NEXT_ID");
            } else {
                // 레코드가 없으면 생성
                currentId = 0;
                String insertSql = "INSERT INTO " + table + " (TABLE_NAME, NEXT_ID) VALUES (?, ?)";
                try (PreparedStatement insertPstmt = conn.prepareStatement(insertSql)) {
                    insertPstmt.setString(1, tableName);
                    insertPstmt.setLong(2, blockSize);
                    insertPstmt.executeUpdate();
                }
            }
            
            rs.close();
            pstmt.close();
            
            // 다음 ID 계산
            long nextId = currentId + 1;
            long newNextId = currentId + blockSize;
            
            // 업데이트
            String updateSql = "UPDATE " + table + " SET NEXT_ID = ? WHERE TABLE_NAME = ?";
            pstmt = conn.prepareStatement(updateSql);
            pstmt.setLong(1, newNextId);
            pstmt.setString(2, tableName);
            pstmt.executeUpdate();
            
            conn.commit();
            
            return nextId;
            
        } catch (SQLException e) {
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ex) {
                    // ignore
                }
            }
            throw new Exception("ID 생성 중 오류가 발생했습니다: " + e.getMessage(), e);
        } finally {
            if (rs != null) {
                try {
                    rs.close();
                } catch (SQLException e) {
                    // ignore
                }
            }
            if (pstmt != null) {
                try {
                    pstmt.close();
                } catch (SQLException e) {
                    // ignore
                }
            }
            if (conn != null) {
                try {
                    conn.close();
                } catch (SQLException e) {
                    // ignore
                }
            }
        }
    }
    
    /**
     * 리소스 정리 (destroy 메서드)
     */
    public void destroy() {
        // 필요시 리소스 정리 로직 추가
    }
}