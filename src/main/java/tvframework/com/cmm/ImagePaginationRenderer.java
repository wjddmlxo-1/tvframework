package tvframework.com.cmm;

import tvframework.com.cmm.pagination.AbstractPaginationRenderer;

import jakarta.servlet.ServletContext;

import org.springframework.web.context.ServletContextAware;
/**
 * ImagePaginationRenderer.java ?�래??
 * 
 * @author ?��???
 * @since 2011. 9. 16.
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정?�력(Modification Information) >>
 *   
 *   ?�정??     ?�정??          ?�정?�용
 *  -------    -------------    ----------------------
 *   2011. 9. 16.   ?��???      ?��?지 경로??ContextPath추�?
 * </pre>
 */
public class ImagePaginationRenderer extends AbstractPaginationRenderer implements ServletContextAware{

	private ServletContext servletContext;
	
	public ImagePaginationRenderer() {
	
	}
	
	public void initVariables(){
		firstPageLabel    = "<li>&#160;</li><li><a href=\"?pageIndex={1}\" onclick=\"{0}({1});return false; \"><img src=\"" + servletContext.getContextPath() +  "/images/egovframework/com/cmm/mod/icon/icon_prevend.gif\" alt=\"처음\"   border=\"0\"/></a></li>";
        previousPageLabel = "<li><a href=\"?pageIndex={1}\" onclick=\"{0}({1});return false; \"><img src=\"" + servletContext.getContextPath() +  "/images/egovframework/com/cmm/mod/icon/icon_prev.gif\"    alt=\"?�전\"   border=\"0\"/></a></li>";
        currentPageLabel  = "<li><strong>{0}</strong></li>";
        otherPageLabel    = "<li><a href=\"?pageIndex={1}\" onclick=\"{0}({1});return false; \">{2}</a></li>";
        nextPageLabel     = "<li>&#160;<a href=\"?pageIndex={1}\" onclick=\"{0}({1});return false; \"><img src=\"" + servletContext.getContextPath() +  "/images/egovframework/com/cmm/mod/icon/icon_next.gif\"    alt=\"?�음\"   border=\"0\"/></a></li>";
        lastPageLabel     = "<li><a href=\"?pageIndex={1}\" onclick=\"{0}({1});return false; \"><img src=\"" + servletContext.getContextPath() +  "/images/egovframework/com/cmm/mod/icon/icon_nextend.gif\" alt=\"마지막\" border=\"0\"/></a></li>";
	}

	
    @Override
	public void setServletContext(ServletContext servletContext) {
		this.servletContext = servletContext;
		initVariables();
	}

}
