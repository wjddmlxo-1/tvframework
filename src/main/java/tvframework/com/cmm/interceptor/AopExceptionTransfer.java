package tvframework.com.cmm.interceptor;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;

import tvframework.com.cmm.exception.aspect.ExceptionTransfer;

@Aspect
public class AopExceptionTransfer {
	private ExceptionTransfer exceptionTransfer;

	public void setExceptionTransfer(ExceptionTransfer exceptionTransfer) {
		this.exceptionTransfer = exceptionTransfer;
	}

	@Pointcut("execution(* tvframework.let..impl.*Impl.*(..)) || execution(* tvframework.com..impl.*Impl.*(..))")
	private void exceptionTransferService() {}

	@AfterThrowing(pointcut= "exceptionTransferService()", throwing="ex")
	public void doAfterThrowingExceptionTransferService(JoinPoint thisJoinPoint, Exception ex) throws Exception{
		exceptionTransfer.transfer(thisJoinPoint, ex);
	}
}
