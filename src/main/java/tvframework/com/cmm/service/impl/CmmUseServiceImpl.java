package tvframework.com.cmm.service.impl;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import tvframework.com.cmm.ComDefaultCodeVO;
import tvframework.com.cmm.service.CmmnDetailCode;
import tvframework.com.cmm.service.CmmUseService;

import tvframework.com.cmm.service.AbstractServiceImpl;

import jakarta.annotation.Resource;

import org.springframework.stereotype.Service;

/**
 * @Class Name : CmmUseServiceImpl.java
 * @Description : 공통코드???�체 ?�무?�서 공용?�서 ?�용?�야 ?�는 ?�비?��? ?�의?�기?�한 ?�비??구현 ?�래??
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
@Service("CmmUseService")
public class CmmUseServiceImpl extends AbstractServiceImpl implements CmmUseService {

	@Resource(name = "cmmUseDAO")
	private CmmUseDAO cmmUseDAO;

	/**
	 * 공통코드�?조회?�다.
	 *
	 * @param vo
	 * @return
	 * @throws Exception
	 */
	@Override
	public List<CmmnDetailCode> selectCmmCodeDetail(ComDefaultCodeVO vo) throws Exception {
		return cmmUseDAO.selectCmmCodeDetail(vo);
	}

	/**
	 * ComDefaultCodeVO??리스?��? 받아???�러개의 코드 리스?��? 맵에 ?�아??리턴?�다.
	 *
	 * @param voList
	 * @return
	 * @throws Exception
	 */
	@Override
	public Map<String, List<CmmnDetailCode>> selectCmmCodeDetails(List<?> voList) throws Exception {
		ComDefaultCodeVO vo;
		Map<String, List<CmmnDetailCode>> map = new HashMap<String, List<CmmnDetailCode>>();

		Iterator<?> iter = voList.iterator();
		while (iter.hasNext()) {
			vo = (ComDefaultCodeVO) iter.next();
			map.put(vo.getCodeId(), cmmUseDAO.selectCmmCodeDetail(vo));
		}

		return map;
	}

	/**
	 * 조직?�보�?코드?�태�?리턴?�다.
	 *
	 * @param 조회조건?�보 vo
	 * @return 조직?�보 List
	 * @throws Exception
	 */
	@Override
	public List<CmmnDetailCode> selectOgrnztIdDetail(ComDefaultCodeVO vo) throws Exception {
		return cmmUseDAO.selectOgrnztIdDetail(vo);
	}

	/**
	 * 그룹?�보�?코드?�태�?리턴?�다.
	 *
	 * @param 조회조건?�보 vo
	 * @return 그룹?�보 List
	 * @throws Exception
	 */
	@Override
	public List<CmmnDetailCode> selectGroupIdDetail(ComDefaultCodeVO vo) throws Exception {
		return cmmUseDAO.selectGroupIdDetail(vo);
	}
}
