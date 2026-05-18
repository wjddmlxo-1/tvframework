package tvframework.sym.usr.service;

import java.io.Serializable;

import org.apache.commons.lang3.builder.ToStringBuilder;

/**
 * 가입약관 VO
 */
public class StplatVO implements Serializable {

	private static final long serialVersionUID = 1L;

	private String useStplatId;
	private String useStplatCn;
	private String infoProvdAgeCn;

	public String getUseStplatId() { return useStplatId; }
	public void setUseStplatId(String useStplatId) { this.useStplatId = useStplatId; }
	public String getUseStplatCn() { return useStplatCn; }
	public void setUseStplatCn(String useStplatCn) { this.useStplatCn = useStplatCn; }
	public String getInfoProvdAgeCn() { return infoProvdAgeCn; }
	public void setInfoProvdAgeCn(String infoProvdAgeCn) { this.infoProvdAgeCn = infoProvdAgeCn; }

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this);
	}
}
