package tvframework.com.cmm.util;

import javax.sql.DataSource;

import tvframework.com.cmm.idgnr.impl.TableIdGnrServiceImpl;
import tvframework.com.cmm.idgnr.strategy.impl.IdGnrStrategyImpl;

/**
 * @ClassName : IdGnrBuilder.java
 * @Description : IdGen ?�보 builder
 *
 * @author : ?�주??
 * @since  : 2021. 7. 20
 * @version : 1.0
 *
 * <pre>
 * << 개정?�력(Modification Information) >>
 *
 *   ?�정??             ?�정??              ?�정?�용
 *  -------------  ------------   ---------------------
 *   2021. 7. 20    ?�주??              최초 ?�성
 * </pre>
 *
 */
public class IdGnrBuilder {

	private DataSource dataSource;
	private IdGnrStrategyImpl idGnrStrategyImpl;

	private String preFix;
	private int cipers;
	private char fillChar;

	private int blockSize;
	private String table;
	private String tableName;

	public IdGnrBuilder setDataSource(DataSource dataSource) {
		this.dataSource = dataSource;
		return this;
	}

	public IdGnrBuilder setIdGnrStrategyImpl(IdGnrStrategyImpl idGnrStrategyImpl) {
		this.idGnrStrategyImpl = idGnrStrategyImpl;
		return this;
	}

	public IdGnrBuilder setPreFix(String preFix) {
		this.preFix = preFix;
		return this;
	}
	public IdGnrBuilder setCipers(int cipers) {
		this.cipers = cipers;
		return this;
	}
	public IdGnrBuilder setFillChar(char fillChar) {
		this.fillChar = fillChar;
		return this;
	}
	public IdGnrBuilder setBlockSize(int blockSize) {
		this.blockSize = blockSize;
		return this;
	}
	public IdGnrBuilder setTable(String table) {
		this.table = table;
		return this;
	}
	public IdGnrBuilder setTableName(String tableName) {
		this.tableName = tableName;
		return this;
	}

	public TableIdGnrServiceImpl build() {

        if (dataSource == null)
            throw new IllegalStateException("dataSource is required");
        if (tableName == null || tableName.isEmpty())
            throw new IllegalStateException("tableName is required");
        if (blockSize <= 0)
            blockSize = 1;
        if (cipers < 0)
            cipers = 0;

		TableIdGnrServiceImpl tableIdGnrServiceImpl = new TableIdGnrServiceImpl();
		tableIdGnrServiceImpl.setDataSource(dataSource);
		if(idGnrStrategyImpl != null) {
			idGnrStrategyImpl = new IdGnrStrategyImpl();
			idGnrStrategyImpl.setPrefix(preFix);
			idGnrStrategyImpl.setCipers(cipers);
			idGnrStrategyImpl.setFillChar(fillChar);

			tableIdGnrServiceImpl.setStrategy(idGnrStrategyImpl);
		}
		tableIdGnrServiceImpl.setBlockSize(blockSize);
		tableIdGnrServiceImpl.setTable(table);
		tableIdGnrServiceImpl.setTableName(tableName);

		return tableIdGnrServiceImpl;
	}



}
