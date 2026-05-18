package tvframework.com.cmm;

import tvframework.com.cmm.exception.ExceptionHandler;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ComOthersExcepHndlr implements ExceptionHandler {

    public void occur(Exception exception, String packageName) {
    	//log.debug(" EgovServiceExceptionHandler run...............");
    	log.error(packageName, exception);
    }
}
