package tvframework.com.cmm.service.impl;

import java.util.List;

import org.springframework.stereotype.Repository;

import tvframework.com.cmm.ComDefaultCodeVO;
import tvframework.com.cmm.dataaccess.AbstractMapper;
import tvframework.com.cmm.service.CmmnDetailCode;

/**
 * @Class Name : CmmUseDAO.java
 * @Description : 공통코드???�체 ?�무?�서 공용?�서 ?�용?�야 ?�는 ?�비?��? ?�의?�기?�한 ?�이???�근 ?�래??
 * @Modification Information
 *
 *    ?�정??      ?�정??        ?�정?�용
 *    -------        -------     -------------------
 *    2009. 3. 11.     ?�삼??
 *
 * @author 공통 ?�비??개발?� ?�삼??
 * @since 2009. 3. 11.
 * @version
 * @see
 *
 */
@Repository("cmmUseDAO")
public class CmmUseDAO extends AbstractMapper {

    /**
     * 주어�?조건???�른 공통코드�?불러?�다.
     *
     * @param vo
     * @return
     * @throws Exception
     */
    public List<CmmnDetailCode> selectCmmCodeDetail(ComDefaultCodeVO vo) throws Exception {
		return selectList("CmmUseDAO.selectCmmCodeDetail", vo);
	}

    /**
     * 공통코드�??�용??조직?�보�?불러?�다.
     *
     * @param vo
     * @return
     * @throws Exception
     */
    public List<CmmnDetailCode> selectOgrnztIdDetail(ComDefaultCodeVO vo) throws Exception {
		return selectList("CmmUseDAO.selectOgrnztIdDetail", vo);
	}

    /**
     * 공통코드�??�용?�그룹정보�? 불러?�다.
     *
     * @param vo
     * @return
     * @throws Exception
     */
    public List<CmmnDetailCode> selectGroupIdDetail(ComDefaultCodeVO vo) throws Exception {
		return selectList("CmmUseDAO.selectGroupIdDetail", vo);
	}
}
