package tvframework.sym.usr.service.impl;

import java.util.Map;

import jakarta.annotation.Resource;

import org.springframework.stereotype.Service;

import tvframework.com.cmm.service.AbstractServiceImpl;
import tvframework.sym.usr.service.CmmnUserService;

/**
 * 사용자 API(암호변경 등) — SQL은 CmmnUserManageMapper
 */
@Service("cmmnUserService")
public class CmmnUserServiceImpl extends AbstractServiceImpl implements CmmnUserService {

	@Resource
	private CmmnUserManageMapper cmmnUserManageMapper;

	@Override
	public Integer updateUserPassword(Map<?, ?> map) throws Exception {
		@SuppressWarnings("unchecked")
		Map<String, Object> m = (Map<String, Object>) (Map<?, ?>) map;
		return cmmnUserManageMapper.updateUserPasswordMatchOld(m);
	}
}
