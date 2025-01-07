USE [test_import]
GO
ALTER DATABASE [test_import] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [test_import].[dbo].[sp_fulltext_database] @action = 'disable'
end
GO
ALTER DATABASE [test_import] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [test_import] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [test_import] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [test_import] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [test_import] SET ARITHABORT OFF 
GO
ALTER DATABASE [test_import] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [test_import] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [test_import] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [test_import] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [test_import] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [test_import] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [test_import] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [test_import] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [test_import] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [test_import] SET  ENABLE_BROKER 
GO
ALTER DATABASE [test_import] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [test_import] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [test_import] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [test_import] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [test_import] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [test_import] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [test_import] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [test_import] SET RECOVERY FULL 
GO
ALTER DATABASE [test_import] SET  MULTI_USER 
GO
ALTER DATABASE [test_import] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [test_import] SET DB_CHAINING OFF 
GO
ALTER DATABASE [test_import] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [test_import] SET TARGET_RECOVERY_TIME = 0 SECONDS 
GO
ALTER DATABASE [test_import] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [test_import] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [test_import] SET QUERY_STORE = OFF
GO
USE [test_import]
GO
/****** Object:  User [##MS_PolicyEventProcessingLogin##]    Script Date: 20/09/2023 11:04:12 ******/
CREATE USER [##MS_PolicyEventProcessingLogin##] FOR LOGIN [##MS_PolicyEventProcessingLogin##] WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [##MS_AgentSigningCertificate##]    Script Date: 20/09/2023 11:04:12 ******/
CREATE USER [##MS_AgentSigningCertificate##] FOR LOGIN [##MS_AgentSigningCertificate##]
GO
/****** Object:  UserDefinedFunction [dbo].[1111_parView_pag_selectBusinessPartner]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[1111_parView_pag_selectBusinessPartner] (
@IDcompany int,
/*Filtri su testo solo "like" */
@BPdesc nvarchar(100), 
/*Selezione clienti fornitori */
@customer bit,
@supplier bit,
/*Parametri pagining tabella*/
@page int, @recordPerPage int
)
/*
Utilizzata in 
- masterdata_business_partner.php
- receipt_select_supplier.php
*/
returns @TmpTable table(totRecords int, totPages int, /* Dati per il pagining */
						IDbp int, [desc] nvarchar(100), supplier bit, customer bit)						
AS
BEGIN
insert into @TmpTable (totRecords, totPages, IDbp, [desc], supplier, customer)
 
select 
COUNT(*) OVER () as totRecords,								/* 2020-04-27 estrazione del numero totale dei record senza doverli ricontare successivamente */
(
/* Se il risultato della divisione è con la virgola abbiamo dei record nella pagina successiva, quindi mettiamo una pagina agg. che non sarà piena */
case when (cast(COUNT(*) OVER () as decimal) / @recordPerPage)%1 = 0 then (COUNT(*) OVER () / @recordPerPage) else (COUNT(*) OVER () / @recordPerPage) + 1 end
) as totPages,        /* 2020-04-27 Conteggio delle pagine direttamente sulla prima query */
IDbp, [desc], supplier, customer
FROM dbo.bp 
where bp.IDcompany = @IDcompany and
/*I parametri @supplier e @customer indicano queli BP estrarre, 
questa condizione fa in modo che 
- @customer = 0 e @supplier = 1 : estrae tutti quelli che sono fornitori
- @customer = 1 e @supplier = 0 : estrae tutti quelli che sono clienti
- @customer = 1 e @supplier = 1 : estrae tutto */
((@supplier = 1 and supplier = 1) or (@customer = 1 and customer = 1))
/* filtri su testi, eseguiti sempre stile like (senza possibilità di scegliere = o *)*/
and dbo.checkValueByCondition('*','char', [desc],@BPdesc) = 1
order by [desc]
offset (@recordPerPage * (
@page  /* Numero di pagina selezionata dall'utente */
-1))   /* Attenzione, la paginazione inizia con lo 0 */ 
rows fetch next @recordPerPage rows only
RETURN
end;
GO
/****** Object:  UserDefinedFunction [dbo].[1111_parView_pag_selectItem_All]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[1111_parView_pag_selectItem_All] (
@IDcompany int,
/*Filtri su testo solo "like" */
@item nvarchar(47), 
@desc nvarchar(100), 
/*Parametri pagining tabella*/
@page int, @recordPerPage int
)
/*
(a differenza della "parView_pag_selectItem" questa estrae tutti gli articoli, non solo quelli "attivi")
Utilizzata in 
- masterdata_item.php 
*/
returns @TmpTable table(totRecords int, totPages int, /* Dati per il pagining */
						IDitem int, item nvarchar(47), item_desc nvarchar(100), 
						um nvarchar(3), item_group nvarchar(10), comp_desc nvarchar(35),
						IDitemEnable bit, DefaultUnitValue float, altv_code  nvarchar(47), altv_desc nvarchar(100))						
AS
BEGIN
insert into @TmpTable (totRecords, totPages, IDitem, item, item_desc, um, item_group, comp_desc, IDitemEnable, DefaultUnitValue, altv_code, altv_desc)
select 
COUNT(*) OVER () as totRecords,								/* 2020-04-27 estrazione del numero totale dei record senza doverli ricontare successivamente */
(
/* Se il risultato della divisione è con la virgola abbiamo dei record nella pagina successiva, quindi mettiamo una pagina agg. che non sarà piena */
case when (cast(COUNT(*) OVER () as decimal) / @recordPerPage)%1 = 0 then (COUNT(*) OVER () / @recordPerPage) else (COUNT(*) OVER () / @recordPerPage) + 1 end
) as totPages,        /* 2020-04-27 Conteggio delle pagine direttamente sulla prima query */
i.IDitem, i.item, i.item_desc, i.um, i.item_group, 
c.[desc] as comp_desc, isnull(ie.IDitem,0) as IDitemEnable, DefaultUnitValue
,altv_code  --2021-04-17, Aggiunta transcodicata articoli (x kruse)
,altv_desc  --2021-04-17, Aggiunta transcodicata articoli (x kruse)
from dbo.item i 
inner join dbo.company c on c.IDcompany = i.IDcompany
left outer join dbo.item_enabled ie on ie.IDcompany = @IDcompany and ie.IDitem = i.IDitem  
where i.IDcompany in (0, @IDcompany)
/* filtri su testi, eseguiti sempre stile like (senza possibilità di scegliere = o *)*/
and dbo.checkValueByCondition('*','char', item, @item) = 1
and dbo.checkValueByCondition('*','char', item_desc,@desc) = 1
order by item_desc
offset (@recordPerPage * (
@page  /* Numero di pagina selezionata dall'utente */
-1))   /* Attenzione, la paginazione inizia con lo 0 */ 
rows fetch next @recordPerPage rows only
RETURN
end;
GO
/****** Object:  UserDefinedFunction [dbo].[1111getQtyStockByLot]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[1111getQtyStockByLot] (@IDcomp int, @IDlot nvarchar(20), @IDwh int, @IDwhl int)
RETURNS float
AS BEGIN
	
	/* La usiamo nella funzione per il controllo che ci sia lo stock */

	declare @qty float = 0
	
	if (@IDwh <> 0 and @IDwhl <> 0 )
	begin
		select @qty = isnull(sum(qty_stock),0)
		from dbo.stock 
		where IDcompany = @IDcomp and IDlot = @IDlot
		and IDwarehouse = @IDwh and IDlocation = @IDwhl
	end
	else
	begin
		select @qty = isnull(sum(qty_stock),0)
		from dbo.stock 
		where IDcompany = @IDcomp and IDlot = @IDlot
	end

    return @qty
END;
GO
/****** Object:  UserDefinedFunction [dbo].[1111parView_pag_lotValueToCheck]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[1111parView_pag_lotValueToCheck] (
@IDcompany int,
/*Filtri su testo solo "like" */
@IDlot nvarchar(20),
@IDlot_fornitore nvarchar(20),
@item nvarchar(47),
@itemDesc nvarchar(47),
@BPdesc nvarchar(100),
@Whdesc nvarchar(100),
@delivery_note nvarchar(200),
@conf_item  nvarchar(3),
/*Parametri pagining tabella*/
@page int, @recordPerPage int
)
returns @TmpTable table(totRecords int, totPages int, /* Dati per il pagining */
						IDlot nvarchar(20), IDlot_fornitore nvarchar(20), item nvarchar(47), item_desc nvarchar(100), 
						date_ins datetime, date_lot datetime,  um nvarchar(3), LA float, LU float, PZ float, DE float, DI float, bpdesc nvarchar(100),
						UnitValue float, price_piece float, tval float, totStock float, ord_rif nvarchar(100), loadedWhDesc nvarchar(100), delivery_note nvarchar(200), conf_item nvarchar(3))						
AS
BEGIN
/* Per semplificare il caricamento cerchiamo il primo magazzino di carico del lotto, cosi, ad esempio i francesi
si vedono i loro lotti in ogni branch. Memo, non "possiamo" mettere il magazzino di giacenza in quanto i lotti frazionabili
potrebbero essere su più magazzini */
insert into @TmpTable (totRecords, totPages, IDlot, IDlot_fornitore, item, item_desc, date_ins, date_lot, um, LA, LU, PZ, DE, DI, bpdesc, UnitValue, price_piece, tval, totStock, ord_rif, loadedWhDesc, delivery_note, conf_item)
select 
COUNT(*) OVER () as totRecords,								/* 2020-04-27 estrazione del numero totale dei record senza doverli ricontare successivamente */
(
/* Se il risultato della divisione è con la virgola abbiamo dei record nella pagina successiva, quindi mettiamo una pagina agg. che non sarà piena */
case when (cast(COUNT(*) OVER () as decimal) / @recordPerPage)%1 = 0 then (COUNT(*) OVER () / @recordPerPage) else (COUNT(*) OVER () / @recordPerPage) + 1 end
) as totPages,        /* 2020-04-27 Conteggio delle pagine direttamente sulla prima query */
IDlot, IDlot_fornitore, item, item_desc, date_ins, date_lot, um, LA, LU, PZ, DE, DI, bpdesc, UnitValue, case when isnull(PZ,0) <> 0 then tval/PZ else 0 end as price_piece
,tval, totStock, ord_rif, loadedWhDesc, delivery_note, conf_item
from 
(
SELECT l.IDlot,item,item_desc,substring(convert(varchar, l.date_ins, 20),1,16) as date_ins , 
substring(convert(varchar, l.date_lot, 20),1,16) as date_lot, um, 
l.IDlot_fornitore, 
--dbo.getDimByLotShortDesc (l.IDcompany, l.IDlot) as dimensions  -- 2023-01-14
isnull(LA,'') as LA, isnull(LU,'') as LU, isnull(PZ,'') as PZ,  isnull(DE,'') as DE, isnull(DI,'') as DI
,isnull(bp.[desc],'') as bpdesc,v.UnitValue 
,sum((qty_stock * v.UnitValue)) as tval  
,sum(qty_stock) as totStock 
,l.ord_rif
,[dbo].[getLoadedWarehouseByLot] (l.IDcompany, l.IDlot) as loadedWhDesc
,delivery_note
,case when conf_item = 0 then 'No' else 'Yes' end as conf_item
FROM dbo.lot l  
inner join dbo.vw_lot_last_value v on v.IDcompany = l.IDcompany and v.IDlot = l.IDlot  
inner join dbo.stock s on s.IDcompany = l.IDcompany and l.IDlot = s.IDlot  
inner join dbo.item i on i.IDitem = l.IDitem  
/* Non tutti gli articoli hanno tutte le dimensioni (2020-04-16 aggiunta pivot sulle dimensioni lotto) 
2020-04-27, usando la pivot usiamo la inner join in quanto tutti i lotti hanno almeno una dimensione */
--2021-03-19, la semplice view sulle dimensioni rallentava drasticamente l'estrazione, con la vista parametrica le perf. sono migliorate
--inner join dbo.vw_lotDimensionsPivot dim on dim.IDcompany = stock.IDcompany and dim.IDlot = stock.IDlot
-- 2023-01-14,AB, copiata da stock viewer per gestire i "pezzi" in modo da calcolare il prezzo per pezzo nei configurati
inner join dbo.parView_lotDimensionsPivot(@IDcompany) dim on dim.IDlot = l.IDlot
left outer join dbo.bp on bp.IDcompany = l.IDcompany and bp.IDbp = l.IDbp  
left outer join dbo.receptions rc on rc.IDcompany = l.IDcompany and l.IDlot = rc.IDlot and l.IDlot_fornitore = rc.IDlot_fornitore
where l.IDcompany = @IDcompany and checked_value = 0  
/* filtri su testi, eseguiti sempre stile like (senza possibilità di scegliere = o *) */
and dbo.checkValueByCondition('*','char', l.IDlot, @IDlot) = 1
and dbo.checkValueByCondition('*','char', l.IDlot_fornitore,@IDlot_fornitore) = 1
and dbo.checkValueByCondition('*','char', item, @item) = 1
and dbo.checkValueByCondition('*','char', item_desc, @itemDesc) = 1
and dbo.checkValueByCondition('*','char', isnull(bp.[desc],''), @BPdesc) = 1
and dbo.checkValueByCondition('*','char', isnull(delivery_note,''), @delivery_note) = 1
and dbo.checkValueByCondition('*','char', (case when conf_item = 0 then 'No' else 'Yes' end), @conf_item) = 1
group by l.IDlot,item,item_desc,substring(convert(varchar, l.date_ins, 20),1,16), substring(convert(varchar, l.date_lot, 20),1,16), um,  
		l.IDlot_fornitore, 
		isnull(LA,''), isnull(LU,''), isnull(PZ,''),isnull(DE,''), isnull(DI,'')
		,isnull(bp.[desc],''),v.UnitValue	,l.IDcompany, l.ord_rif, delivery_note, conf_item
) GroupedTabled
/* Lo mettiamo qui per leggero una singola volta, e non leggerlo 2 volte per ogni record, 1 per metterlo a video e una per 
verificare al codinzione */
where dbo.checkValueByCondition('*','char', loadedWhDesc, @Whdesc) = 1
order by IDlot
offset (@recordPerPage * (
@page  /* Numero di pagina selezionata dall'utente */
-1))   /* Attenzione, la paginazione inizia con lo 0 */ 
rows fetch next @recordPerPage rows only
RETURN
end;
GO
/****** Object:  UserDefinedFunction [dbo].[1111parView_pag_stockByWidth]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[1111parView_pag_stockByWidth] (@IDcompany int, @page int, @recordPerPage int)
returns @TmpTable table(totRecords int, totPages int, wdesc nvarchar(100), wldesc nvarchar(100), item nvarchar(47), item_desc nvarchar(100), larghezza float, m2 float)
AS
BEGIN
/* dichiarazione tabella temporanea: carico l'estrazione intera al suo interno, effettuo il conteggio dei record e il calcolo 
dei record per pagina, partiremo poi da questa tabella temporane per estrarre le paginazioni (riducendo cosi il numero di query eseguite )
- la riga rownr (identity) la usiamo per far ordinare i record una sola volta (la prima) in quanto è una delle operazioni più onerose.
*/
insert into @TmpTable(totRecords, totPages, wdesc, wldesc, item, item_desc, larghezza, m2)  /* Tabella temporanea che carico da spedire fuori */
/* Query principale */
select 
COUNT(*) OVER () as totRecords,								/* 2020-04-27 estrazione del numero totale dei record senza doverli ricontare successivamente */
(
/* Se il risultato della divisione è con la virgola abbiamo dei record nella pagina successiva, quindi mettiamo una pagina agg. che non sarà piena */
case when (cast(COUNT(*) OVER () as decimal) / @recordPerPage)%1 = 0 then (COUNT(*) OVER () / @recordPerPage) else (COUNT(*) OVER () / @recordPerPage) + 1 end
) as totPages,        /* 2020-04-27 Conteggio delle pagine direttamente sulla prima query */
w.[desc] as wdesc, wl.[desc] as wldesc, i.item, i.item_desc, ld.val as larghezza, sum(qty_stock) as m2      
FROM dbo.stock s
inner join dbo.lot l on l.IDcompany = s.IDcompany and s.IDlot = l.IDlot
inner join dbo.item i on i.IDitem = l.IDitem
inner join dbo.lot_dimension ld on s.IDcompany = ld.IDcompany and s.IDlot = ld.IDlot and ld.IDcar = 'LA'
inner join dbo.warehouse w on w.IDcompany = s.IDcompany and w.IDwarehouse = s.IDwarehouse
inner join dbo.warehouse_location wl on wl.IDcompany = s.IDcompany and wl.IDlocation = s.IDlocation
where s.IDcompany = @IDcompany and i.um	= 'm2' 
group by  s.IDcompany , w.[desc], wl.[desc], i.IDitem, i.item, i.item_desc, ld.val
order by larghezza
offset (@recordPerPage * (
@page  /* Numero di pagina selezionata dall'utente */
-1))   /* Attenzione, la paginazione inizia con lo 0 */ 
rows fetch next @recordPerPage rows only
RETURN
end;
GO
/****** Object:  UserDefinedFunction [dbo].[1111Split_string_to_lots_table]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[1111Split_string_to_lots_table] ( @strString varchar(4000), @separatore nvarchar(1))
RETURNS  @Result TABLE(Value nvarchar(20), indice int)
AS
BEGIN
/* 2018 11 08, aggiunto il parametro per il separatore e l'indice di riga per poter selezionare il record */
 
      DECLARE @x XML 
      SELECT @x = CAST('<A>'+ REPLACE(@strString,@separatore,'</A><A>')+ '</A>' AS XML)
     
      INSERT INTO @Result            
      SELECT t.value('.', 'nvarchar(20)') AS inVal, ROW_NUMBER() OVER(ORDER BY t ASC)
      FROM @x.nodes('/A') AS x(t)
 
    RETURN
END;
GO
/****** Object:  UserDefinedFunction [dbo].[calcQtyFromDimensionByUM]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[calcQtyFromDimensionByUM] (@um nvarchar(5), @LA float, @LU float, @PZ float, @DI float, @DE float)
RETURNS float
AS BEGIN
	
	/* La usiamo nella funzione per il controllo che ci sia lo stock 
	usage: 
	select [dbo].[calcQtyFromDimensionByUM] ('m',0,50,0,0,0)
	select [dbo].[calcQtyFromDimensionByUM] ('m',0,50,1,0,0)
	select [dbo].[calcQtyFromDimensionByUM] ('m',0,50,2,0,0)
	*/

	declare @qty float = 0
	
	if (@um = 'm2')
	begin
		set @qty = @LA*@LU*@PZ/1000000
	end

	if (@um = 'm')
	begin
		/*2021-05-17, AB, sulla parView_pag_receipt_chiorino_lots_delivery_notes utilizziamo questa funzione per il calcolo
		delle qty, nel caso specifico degli ES abbiamo ancora le dimensioni che arrivano da LN, cioò LU e PZ (I pz non verranno
		più considerati in quanto qui l'UM degli ES è "m" ed è frazionabile. Qui quindi verifichiamo se PZ è diverso da null e in
		tal caso lo usiamo */
		if (isnull(@PZ,0) = 0)
		begin
			set @qty = @LU/1000
		end
		else
		begin
			set @qty = @PZ*@LU/1000
		end
	end

	if (@um = 'N')
	begin
		set @qty = @PZ
	end

	if (@um = 'kg')
	begin
		set @qty =  @PZ
	end

	if (@um = 'NP') /* Numero di tubi */
	begin
		set @qty = @PZ
	end

    return @qty
END;
GO
/****** Object:  UserDefinedFunction [dbo].[checkValueByCondition]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[checkValueByCondition] (@condition nvarchar(3), @valueType nvarchar(5), @tableValue nvarchar(max), @filterValue nvarchar(50))
RETURNS float
AS BEGIN
	/* Questa funzione riceve in input la condizione (es: <,>=, >.....), il valore letto in tabella e
	il valore imposto dall'utente (filtro), e restiusce si\no per definire se il record rispetta la condizione	
	dove c'è > o < ecc li consideriamo dei valori numerici e li convertiamo in numeri

	valueType = float , date , char 

	NB: funzione sviluppata per la fuzione:  parView_StockViewer (pagina web stock_viewer.php)
	*/

	declare @trueFalse bit = 0 /* 0=no 1=si */

	if ltrim(rtrim(@filterValue)) = ''  begin set @trueFalse = 1 end/* Se non ci sono valori non effetuiamo nessun confronto */
	else
	begin 
		if @valueType = 'float'
		begin
				if @condition = '>=' 
				begin 
					if cast(@tableValue as float) >= cast(@filterValue as float) begin set @trueFalse = 1 end
				end

				if @condition = '<=' begin 
					if cast(@tableValue as float) <= cast(@filterValue as float) begin set @trueFalse = 1 end
				end

				if @condition = '>'  begin 
					if cast(@tableValue as float) > cast(@filterValue as float) begin set @trueFalse = 1 end
				end

				if @condition = '<'  begin 
					if cast(@tableValue as float) < cast(@filterValue as float) begin set @trueFalse = 1 end
				end

				if @condition = '='  begin 
					if cast(@tableValue as float) = cast(@filterValue as float) begin set @trueFalse = 1 end
				end
				if @condition = '*'  begin  /* In questo caso trattiamo in numeri con caratteri*/
					if CHARINDEX(@filterValue, @tableValue) > 0 begin set @trueFalse = 1 end
				end
		end

		if @valueType = 'char'
		begin
				if @condition = '='  begin 
					if @tableValue = @filterValue begin set @trueFalse = 1 end
				end
				if @condition = '*'  begin  /* In questo caso trattiamo in numeri con caratteri*/
					/*if CHARINDEX(@filterValue, @tableValue) > 0 begin set @trueFalse = 1 end
					2020 04 12, search like google ... */
					if CHARINDEX(replace(lower(dbo.fn_StripCharacters(@filterValue, '^a-z0-9')), ' ',''), 
								 replace(lower(dbo.fn_StripCharacters(@tableValue, '^a-z0-9')), ' ','')) > 0 begin set @trueFalse = 1 end
				end
		end

		if @valueType = 'date'
		begin
				if @condition = '>=' 
				begin 
					if cast(@tableValue as date) >= cast(@filterValue as date) begin set @trueFalse = 1 end
				end

				if @condition = '<=' begin 
					if cast(@tableValue as date) <= cast(@filterValue as date) begin set @trueFalse = 1 end
				end

				if @condition = '>'  begin 
					if cast(@tableValue as date) > cast(@filterValue as date) begin set @trueFalse = 1 end
				end

				if @condition = '<'  begin 
					if cast(@tableValue as date) < cast(@filterValue as date) begin set @trueFalse = 1 end
				end

				if @condition = '='  begin 
					if cast(@tableValue as date) = cast(@filterValue as date) begin set @trueFalse = 1 end
				end
				if @condition = '*'  begin  /* In questo caso trattiamo in numeri con caratteri*/
					if CHARINDEX(@filterValue, @tableValue) > 0 begin set @trueFalse = 1 end
				end
		end
	end

    return  @trueFalse
END;
GO
/****** Object:  UserDefinedFunction [dbo].[fn_diagramobjects]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[fn_diagramobjects]() 
	RETURNS int
	WITH EXECUTE AS N'dbo'
	AS
	BEGIN
		declare @id_upgraddiagrams		int
		declare @id_sysdiagrams			int
		declare @id_helpdiagrams		int
		declare @id_helpdiagramdefinition	int
		declare @id_creatediagram	int
		declare @id_renamediagram	int
		declare @id_alterdiagram 	int 
		declare @id_dropdiagram		int
		declare @InstalledObjects	int

		select @InstalledObjects = 0

		select 	@id_upgraddiagrams = object_id(N'dbo.sp_upgraddiagrams'),
			@id_sysdiagrams = object_id(N'dbo.sysdiagrams'),
			@id_helpdiagrams = object_id(N'dbo.sp_helpdiagrams'),
			@id_helpdiagramdefinition = object_id(N'dbo.sp_helpdiagramdefinition'),
			@id_creatediagram = object_id(N'dbo.sp_creatediagram'),
			@id_renamediagram = object_id(N'dbo.sp_renamediagram'),
			@id_alterdiagram = object_id(N'dbo.sp_alterdiagram'), 
			@id_dropdiagram = object_id(N'dbo.sp_dropdiagram')

		if @id_upgraddiagrams is not null
			select @InstalledObjects = @InstalledObjects + 1
		if @id_sysdiagrams is not null
			select @InstalledObjects = @InstalledObjects + 2
		if @id_helpdiagrams is not null
			select @InstalledObjects = @InstalledObjects + 4
		if @id_helpdiagramdefinition is not null
			select @InstalledObjects = @InstalledObjects + 8
		if @id_creatediagram is not null
			select @InstalledObjects = @InstalledObjects + 16
		if @id_renamediagram is not null
			select @InstalledObjects = @InstalledObjects + 32
		if @id_alterdiagram  is not null
			select @InstalledObjects = @InstalledObjects + 64
		if @id_dropdiagram is not null
			select @InstalledObjects = @InstalledObjects + 128
		
		return @InstalledObjects 
	END;
GO
/****** Object:  UserDefinedFunction [dbo].[fn_StripCharacters]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[fn_StripCharacters]
(
    @String NVARCHAR(MAX), 
    @MatchExpression VARCHAR(255)
)
/*
Usage:
SELECT dbo.fn_StripCharacters('a1!s2@d3#f4$', '^a-z')
SELECT dbo.fn_StripCharacters('a1!s2@d3#f4$', '^0-9')
SELECT dbo.fn_StripCharacters('a1!s2@d3#f4$', '^a-z0-9')
SELECT dbo.fn_StripCharacters('a1!s2@d3#f4$', 'a-z0-9')
*/
RETURNS NVARCHAR(MAX)
AS
BEGIN
    SET @MatchExpression =  '%['+@MatchExpression+']%'

    WHILE PatIndex(@MatchExpression, @String) > 0
        SET @String = Stuff(@String, PatIndex(@MatchExpression, @String), 1, '')

    RETURN @String

END;
GO
/****** Object:  UserDefinedFunction [dbo].[get_last_table_id]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[get_last_table_id](@tableName NVARCHAR(MAX))
RETURNS NVARCHAR(MAX)
BEGIN
	DECLARE @id INT = NULL 
	DECLARE @sess_id_key NVARCHAR(100) = CONVERT(NVARCHAR(MAX), CONCAT(N'last-inserted-id-', @tableName))
	--SELECT SESSION_CONTEXT(@sess_id_key) AS id, @sess_id_key AS test
	
	RETURN CONVERT(NVARCHAR(MAX), SESSION_CONTEXT(@sess_id_key))
END
GO
/****** Object:  UserDefinedFunction [dbo].[getActiveInventoryId]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[getActiveInventoryId] (@IDcomp int, @IDadjtype int)
RETURNS nvarchar(max)
AS BEGIN
	
	/* Questa funzione restituisce l'id dell'inventario attivo quando si passa una causale di tipo inventario */

	declare @IDinv nvarchar(max) = null
	declare @invYesNo bit = 0

	select @invYesNo = invetory from dbo.adjustments_type where IDadjtype = @IDadjtype

	if @invYesNo = 1 
	begin
		select @IDinv = IDinventory from inventory where IDcompany = @IDcomp and completed = 0		
	end

    return @IDinv
END;
GO
/****** Object:  UserDefinedFunction [dbo].[getDimByLot]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[getDimByLot] (@IDcomp int, @IDlot nvarchar(20))
RETURNS nvarchar(100)
AS BEGIN

	DECLARE @dim_string nvarchar(100) = ''
	DECLARE @dim_counter int = 1
	
	/* recupero dell'um dell'articolo in base al lotto */
    DECLARE @um nvarchar(3) = (select um 
							   from item i 
							   inner join lot l on i.IDitem = l.IDitem
							   where l.IDcompany = @IDcomp and l.IDlot = @IDlot)

	/* Conto le dimensioni */
	DECLARE @num_dim int = (select COUNT(*) from um_dimension where IDdim = @um)

	/* Ciclo N volte quante sono le dimensioni e concateno il valore */
	While @dim_counter <= @num_dim
	Begin
		if (@dim_string = '')
		begin
			set @dim_string = (select rtrim(ud.umdesc) + ': ' + cast(val as nvarchar)
							   from lot_dimension ld
								inner join dbo.um_dimension ud on ud.IDcar = ld.IDcar
								where ud.IDdim = @um and ud.Ordinamento = @dim_counter and 
								ld.IDcompany = @IDcomp and ld.IDlot = @IDlot)
		end
		else
		begin
			set @dim_string = @dim_string + ', ' + (select rtrim(ud.umdesc) + ': ' + cast(val as nvarchar)
											        from lot_dimension ld
											        inner join dbo.um_dimension ud on ud.IDcar = ld.IDcar
											        where ud.IDdim = @um and ud.Ordinamento = @dim_counter and 
													ld.IDcompany = @IDcomp and ld.IDlot = @IDlot)		
		end												 						   		
		set @dim_counter = @dim_counter + 1	
	end

    RETURN @dim_string
END;
GO
/****** Object:  UserDefinedFunction [dbo].[getDimByLotNoDesc]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[getDimByLotNoDesc] (@IDcomp int, @IDlot nvarchar(20))
RETURNS nvarchar(100)
AS BEGIN

	DECLARE @dim_string nvarchar(100) = ''
	DECLARE @dim_counter int = 1
	
	/* recupero dell'um dell'articolo in base al lotto */
    DECLARE @um nvarchar(3) = (select um 
							   from item i 
							   inner join lot l on i.IDitem = l.IDitem
							   where l.IDcompany = @IDcomp and l.IDlot = @IDlot)

	/* Conto le dimensioni */
	DECLARE @num_dim int = (select COUNT(*) from um_dimension where IDdim = @um)

	/* Ciclo N volte quante sono le dimensioni e concateno il valore */
	While @dim_counter <= @num_dim
	Begin
		if (@dim_string = '')
		begin
			set @dim_string = (select cast(val as nvarchar)
							   from lot_dimension ld
								inner join dbo.um_dimension ud on ud.IDcar = ld.IDcar
								where ud.IDdim = @um and ud.Ordinamento = @dim_counter and 
								ld.IDcompany = @IDcomp and ld.IDlot = @IDlot)
		end
		else
		begin
			set @dim_string = @dim_string + ' x ' + (select cast(val as nvarchar)
											        from lot_dimension ld
											        inner join dbo.um_dimension ud on ud.IDcar = ld.IDcar
											        where ud.IDdim = @um and ud.Ordinamento = @dim_counter and 
													ld.IDcompany = @IDcomp and ld.IDlot = @IDlot)		
		end												 						   		
		set @dim_counter = @dim_counter + 1	
	end

    RETURN @dim_string
END;
GO
/****** Object:  UserDefinedFunction [dbo].[getDimByLotShortDesc]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[getDimByLotShortDesc] (@IDcomp int, @IDlot nvarchar(20))
RETURNS nvarchar(100)
AS BEGIN

	DECLARE @dim_string nvarchar(100) = ''
	DECLARE @dim_counter int = 1
	
	/* recupero dell'um dell'articolo in base al lotto */
    DECLARE @um nvarchar(3) = (select um 
							   from item i 
							   inner join lot l on i.IDitem = l.IDitem
							   where l.IDcompany = @IDcomp and l.IDlot = @IDlot)

	/* Conto le dimensioni */
	DECLARE @num_dim int = (select COUNT(*) from um_dimension where IDdim = @um)

	/* Ciclo N volte quante sono le dimensioni e concateno il valore */
	While @dim_counter <= @num_dim
	Begin
		if (@dim_string = '')
		begin
			set @dim_string = (select rtrim(ud.umdescs) + ':' + cast(val as nvarchar)
							   from lot_dimension ld
								inner join dbo.um_dimension ud on ud.IDcar = ld.IDcar
								where ud.IDdim = @um and ud.Ordinamento = @dim_counter and 
								ld.IDcompany = @IDcomp and ld.IDlot = @IDlot)
		end
		else
		begin
			set @dim_string = @dim_string + ' ' + (select rtrim(ud.umdescs) + ':' + cast(val as nvarchar)
											        from lot_dimension ld
											        inner join dbo.um_dimension ud on ud.IDcar = ld.IDcar
											        where ud.IDdim = @um and ud.Ordinamento = @dim_counter and 
													ld.IDcompany = @IDcomp and ld.IDlot = @IDlot)		
		end												 						   		
		set @dim_counter = @dim_counter + 1	
	end

    RETURN @dim_string
END;
GO
/****** Object:  UserDefinedFunction [dbo].[getLoadedWarehouseByLot]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[getLoadedWarehouseByLot] (@IDcomp int, @IDlot nvarchar(20))
RETURNS nvarchar(100)
AS BEGIN

	DECLARE @dim_string nvarchar(100) = ''

	select top 1 @dim_string = w.[desc] 
	from transactions t
	inner join warehouse w on w.IDcompany = t.IDcompany and w.IDwarehouse = t.IDwarehouse
	where t.IDcompany = @IDcomp and t.IDlot = @IDlot
	order by date_tran asc

    RETURN @dim_string
END;
GO
/****** Object:  UserDefinedFunction [dbo].[getM2ByLotLALUPZ]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[getM2ByLotLALUPZ] (@IDcomp int, @IDlot nvarchar(20))
RETURNS float
AS BEGIN

	declare @qty float = 0
	declare @LA float  = 0
	declare @LU float  = 0
	declare @PZ float  = 0

	select @LA=val from dbo.lot_dimension where IDcompany = @IDcomp and IDlot = @IDlot and IDcar = 'LA'
	select @LU=val from dbo.lot_dimension where IDcompany = @IDcomp and IDlot = @IDlot and IDcar = 'LU'
	select @PZ=val from dbo.lot_dimension where IDcompany = @IDcomp and IDlot = @IDlot and IDcar = 'PZ'

	-- Calcolo qty in m2 (questa è una commessa di taglio e accetta solo materiali in m2 !!!)
	set @qty = @LA*@LU*@PZ/1000000	

    RETURN @qty
END;
GO
/****** Object:  UserDefinedFunction [dbo].[parView_lotValueToCheckCount]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create FUNCTION [dbo].[parView_lotValueToCheckCount] (
@IDcompany int,
/*Filtri su testo solo "like" */
@IDlot nvarchar(20),
@IDlot_fornitore nvarchar(20),
@item nvarchar(47),
@itemDesc nvarchar(47),
@BPdesc nvarchar(100),
@Whdesc nvarchar(100)
)
RETURNS int
AS BEGIN
DECLARE @NumRecords int = 0
set @NumRecords = 
(select count(IDlot) from parView_lotValueToCheck(@IDcompany, @IDlot, @IDlot_fornitore, @item, @itemDesc, @BPdesc, @Whdesc, 0,99999))
    RETURN @NumRecords
END;
GO
/****** Object:  UserDefinedFunction [dbo].[parView_pag_order_merge_select_lots_filter_item_whl]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_pag_order_merge_select_lots_filter_item_whl] (
@IDcompany int,
@IDitem nvarchar(47), 
@IDwarehouse int, 
/*Filtri su testo solo "like" */
@IDlot nvarchar(20),
@lcdesc nvarchar(100),
/*Parametri pagining tabella*/
@page int, @recordPerPage int
)
/*
Utilizzata in 
- order_lot_merge.php
example 
*/
returns @TmpTable table(totRecords int, totPages int, /* Dati per il pagining */
						IDstock bigint,IDlot nvarchar(20), IDlot_padre nvarchar(20), qty_stock float, um nvarchar(3), 
						LA float, LU float, PZ float, stepRoll bit, date_lot varchar(16), loc_desc nvarchar(100))						
AS
BEGIN
insert into @TmpTable (totRecords, totPages, IDstock, IDlot, IDlot_padre, qty_stock, um, LA, LU, PZ, stepRoll, date_lot, loc_desc)
select 
COUNT(*) OVER () as totRecords,								/* 2020-04-27 estrazione del numero totale dei record senza doverli ricontare successivamente */
(
/* Se il risultato della divisione è con la virgola abbiamo dei record nella pagina successiva, quindi mettiamo una pagina agg. che non sarà piena */
case when (cast(COUNT(*) OVER () as decimal) / @recordPerPage)%1 = 0 then (COUNT(*) OVER () / @recordPerPage) else (COUNT(*) OVER () / @recordPerPage) + 1 end
) as totPages,        /* 2020-04-27 Conteggio delle pagine direttamente sulla prima query */
  s.IDstock, s.IDlot, l.IDlot_padre, s.qty_stock, I.um, d.LA, d.LU, d.PZ, stepRoll, substring(convert(varchar, date_lot, 20),1,16) AS date_lot, whl.[desc] as loc_desc
  from stock s
  inner join lot l on s.IDcompany = l.IDcompany and s.IDlot = l.IDlot
  inner join warehouse_location whl on whl.IDcompany = s.IDcompany and whl.IDlocation = s.IDlocation
  inner join [dbo].[parView_lotDimensionsPivot] (845) d on d.IDlot = s.IDlot
  inner join item i on i.IDitem = l.IDitem
  where i.IDitem = @IDitem and s.IDwarehouse = @IDwarehouse
  /* filtri su testi, eseguiti sempre stile like (senza possibilità di scegliere = o *)*/
  and dbo.checkValueByCondition('*','char', s.IDlot, @IDlot ) = 1  
  and dbo.checkValueByCondition('*','char', whl.[desc], @lcdesc) = 1
  and s.IDstock not in (select IDstock from [dbo].[order_merge_rows_picking])  -- eslcudiamo record già inseriti in altre commesse di cucitura
order by LU, LA, IDlot, IDlot_padre
offset (@recordPerPage * (
@page  /* Numero di pagina selezionata dall'utente */
-1))   /* Attenzione, la paginazione inizia con lo 0 */ 
rows fetch next @recordPerPage rows only
RETURN
end;
GO
/****** Object:  UserDefinedFunction [dbo].[parView_pag_receipt_chiorino_lots_delivery_notes]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO









/****** Script for SelectTopNRows command from SSMS  ******/



CREATE FUNCTION [dbo].[parView_pag_receipt_chiorino_lots_delivery_notes] (@IDcompany int, @ddt nvarchar(19), @IDlot nvarchar(20),
																		 /*Parametri pagining tabella*/
																		 @page int, @recordPerPage int)

/*
usage: 
select * from [dbo].[parView_pag_receipt_chiorino_lots_delivery_notes] (900, '7300000000000001516','',1,100) 
select * from [dbo].[parView_pag_receipt_chiorino_lots_delivery_notes] (900, '7300000000000001516','ITBIF21017616',1,100) 
select * from [dbo].[parView_pag_receipt_chiorino_lots_delivery_notes] (900, '','ITBIF21017616',1,100)  
select * from [dbo].[parView_pag_receipt_chiorino_lots_delivery_notes] (846,'7800000000000000332','',2,100)

La funzione può essere chiamata o con il numero DDT e con il solo codice lotto.
*/

returns @TmpTable table(totRecords int, totPages int, /* Dati per il pagining */
						IDrecord bigint, delivery_note_date varchar(20), t_clot nvarchar(20), item nvarchar(47),
						item_desc nvarchar(47), IDitem int, um nvarchar(3), eur1 bit, t_corn nvarchar(30),
						t_qshp float, t_amti float, [LA] float, [LU] float, [PZ] float, [DE] float, [DI] float, 
						LotAlreadyRec int, PermittedDim nvarchar(100),  CSM_bpid_code int, t_deln nvarchar(19),
						t_shpm nvarchar(19), t_pono int, conf_item bit)
AS
BEGIN

	insert into @TmpTable (totRecords, totPages, 
							IDrecord, delivery_note_date, t_clot, item, item_desc, IDitem, um, eur1, t_corn,
							t_qshp, t_amti, [LA], [LU], [PZ], [DE], [DI], LotAlreadyRec, PermittedDim,  CSM_bpid_code, t_deln,
							t_shpm, t_pono, conf_item)

	SELECT
	COUNT(*) OVER () as totRecords,	    /*  estrazione del numero totale dei record senza doverli ricontare successivamente */

	(
	/* Se il risultato della divisione è con la virgola abbiamo dei record nella pagina successiva, quindi mettiamo una pagina agg. che non sarà piena */
	case when (cast(COUNT(*) OVER () as decimal) / @recordPerPage)%1 = 0 then (COUNT(*) OVER () / @recordPerPage) else (COUNT(*) OVER () / @recordPerPage) + 1 end
	) as totPages,        /*  Conteggio delle pagine direttamente sulla prima query */ 

	[IDrecord]
	,substring(convert(varchar, [t_crdt], 20),1,16) AS delivery_note_date
	,[t_clot]      
    ,[item]
	,item_desc
	,i.IDitem
	,[um]
    ,[eur1]
    ,[t_corn]
    ,--[t_qshp]
	[dbo].[calcQtyFromDimensionByUM]([um],[LA],[LU],[PZ],[DE],[DI])
    ,[t_amti]
	,[LA],
	-- Per gli articoli ES che qui gestiamo come frazionabili dobbiamo moltiplicare lunghezza per i pezzi che arrivano da LN,
	-- Il campo "PZ" che leggiamo non verrà poi considerato dal flusso successivamente.
	case when i.item_group = 'ES' then   
						[LU] * [PZ]
					else
						[LU]
					end as [LU],
	[PZ],[DE],[DI]
	  
	,(select COUNT(*) from lot where lot.IDcompany = etl.IDcompany and IDlot_fornitore = etl.[t_clot]) as LotAlreadyRec

	,stuff((
	select ',' + IDcar+':'+ltrim(rtrim(umdesc))
	from [dbo].[um_dimension]
	where IDdim = i.um
	order by Ordinamento asc
	for xml path('')
	),1,1,'') as PermittedDim

	,c.CSM_bpid_code			/* ID customer csm */

	/* Campi usati solo per ordinamento e per identificare il record in fase di ricevimento */
	,etl.t_deln
	,etl.t_shpm		
	,etl.t_pono

	,etl.conf_item  --2023-01-02, AB, gestione articoli conf.

	FROM [dbo].[zETL_LN_lots_delivery_notes_from_biella] etl
	inner join dbo.company c on etl.IDcompany = c.IDcompany
	inner join dbo.item i on i.IDitem = etl.IDitem
	inner join dbo.vw_zETL_LN_lot_dimension_from_biellaPivot dim on dim.IDcompany = etl.IDcompany and 
																	dim.t_deln = etl.t_deln and 
																	dim.t_shpm = etl.[t_shpm] and
																	dim.t_pono = etl.[t_pono] and
																	dim.IDlot = etl.[t_clot]
	where etl.IDcompany = @IDcompany 
  
	/* Le condizioni qui sotto servono per avere questa situazione:
	- Se l'utente inserisce solo il DDT estraiamo tutti i record con quel DDT
	- Se l'utente inserisce solo il lotto estraiamo tutti i record con quel lotto
	- Se l'utente inserisce sia il lotto che il DDT estraiamo in "and", cioè i record che contengono le 2 occorrenze contemporaneamente 
	- Se l'utente non mette nulla non estraiamo nulla */
	and  
	(
	(etl.t_deln = @ddt and ltrim(rtrim(@IDlot)) = '')   /* Caso in cui metto solo il ddt, */
	or  
	(etl.t_clot = ltrim(rtrim(@IDlot)) and (etl.t_deln = @ddt or ltrim(rtrim(@ddt)) = ''))				   /* Caso in cui metto solo il ddt, */
	)


	order by etl.t_deln, t_shpm, t_pono   /* Ordine per avere l'estrazione uguale al ddt spedito */

	offset (@recordPerPage * (

	@page  /* Numero di pagina selezionata dall'utente */

	-1))   /* Attenzione, la paginazione inizia con lo 0 */ 

	rows fetch next @recordPerPage rows only



RETURN;
end;


GO
/****** Object:  UserDefinedFunction [dbo].[parView_pag_selectItem]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_pag_selectItem] (
@IDcompany int,
/*Filtri su testo solo "like" */
@item nvarchar(47), 
@desc nvarchar(100), 
/*Parametri pagining tabella*/
@page int, @recordPerPage int
)
/*
Utilizzata in 
- receipt_select_item.php
- adjustments_select_item.php
*/
returns @TmpTable table(totRecords int, totPages int, /* Dati per il pagining */
						IDitem int, item nvarchar(47), item_desc nvarchar(100), 
						um nvarchar(3), item_group nvarchar(10))						
AS
BEGIN
insert into @TmpTable (totRecords, totPages, IDitem, item, item_desc, um, item_group)
select 
COUNT(*) OVER () as totRecords,								/* 2020-04-27 estrazione del numero totale dei record senza doverli ricontare successivamente */
(
/* Se il risultato della divisione è con la virgola abbiamo dei record nella pagina successiva, quindi mettiamo una pagina agg. che non sarà piena */
case when (cast(COUNT(*) OVER () as decimal) / @recordPerPage)%1 = 0 then (COUNT(*) OVER () / @recordPerPage) else (COUNT(*) OVER () / @recordPerPage) + 1 end
) as totPages,        /* 2020-04-27 Conteggio delle pagine direttamente sulla prima query */
i.IDitem, i.item, i.item_desc, i.um, i.item_group 
from dbo.item i 
inner join dbo.item_enabled ie on ie.IDcompany = @IDcompany
and ie.IDitem = i.IDitem  
where i.IDcompany in (0, @IDcompany)
/* filtri su testi, eseguiti sempre stile like (senza possibilità di scegliere = o *)*/
and dbo.checkValueByCondition('*','char', item, @item) = 1
and dbo.checkValueByCondition('*','char', item_desc,@desc) = 1
order by item_desc
offset (@recordPerPage * (
@page  /* Numero di pagina selezionata dall'utente */
-1))   /* Attenzione, la paginazione inizia con lo 0 */ 
rows fetch next @recordPerPage rows only
RETURN
end;
GO
/****** Object:  UserDefinedFunction [dbo].[parView_pag_selectSupplier]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_pag_selectSupplier] (
@IDcompany int,
/*Filtri su testo solo "like" */
@BPdesc nvarchar(100), 
/*Parametri pagining tabella*/
@page int, @recordPerPage int
)
returns @PagTable table(totRecords int, totPages int, /* Dati per il pagining */
						IDbp int, [desc] nvarchar(100))						
AS
BEGIN
declare @TmpTable table(rownr int identity(1,1), /* Indice di righe per sfruttare l'order by della prima query */
						IDbp int, [desc] nvarchar(100),
						index IDXrownr clustered (rownr) /* Indice del campo identity usato per sfruttare l order by */
						)
declare @totRecords int = 0
declare @totPages int = 0
declare @offset int = 0
insert into @TmpTable (IDbp, [desc])
/* --- # BEGIN: Main query --- */
SELECT IDbp, [desc] 
FROM dbo.bp 
where supplier = 1 and bp.IDcompany = @IDcompany
/* filtri su testi, eseguiti sempre stile like (senza possibilità di scegliere = o *)*/
and dbo.checkValueByCondition('*','char', [desc],@BPdesc) = 1
order by [desc]
/* --- # END : Main query ---*/

/* Conteggio record per pagine */
set @totRecords = (select count(IDbp) from  @TmpTable)
set @totPages = (@totRecords / @recordPerPage) + 1
if (@page > @totPages) begin set @page = 1 end /* Se il numero di pagina è maggiore di quelli esistenti setto la pagina 1 */
set @offset = @recordPerPage * (@page - 1);
/* Caricamento della tabella finale da spedire al client */
insert into @PagTable 
select @totRecords , @totPages, 
IDbp, [desc]
from  @TmpTable order by rownr asc offset @offset rows fetch next @recordPerPage rows only
RETURN;
end;
GO
/****** Object:  UserDefinedFunction [dbo].[parView_pag_stockViewer]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_pag_stockViewer] (
/* 2020 02 07, 
 funzione per l'estrazione dati della pagina stock viewer.
 Questa funzione estrae paginando l'estrazione, per lanciare la funzione:
select * from [dbo].[parView_pag_StockViewer]
(845, 
'Villeneuve','','','','','','', --Filtri su testo solo "like"
'','*','','*','','*',  --Filtri testo con like oppure con l'=    
'100','>','','*','','*', '','*','','*', '','*', '','*', '','=',  --Parametri pagining tabella
1,20,7,'desc' )
 2020 04 03,
 Abbiamo escluso la vista (vw_stock_viewer) all'interno di questa function per 
 questioni di performances inserendo direttamente la query, la vecchia view
 rimane utilizzata per l'estrazione completa dello stock su excel con la 
 pagina web report_service_export_stock_all.php (se vengono effettuate modifiche
 all'interno di questa function è necessario valutare la modifica anche 
 della vecchia vista)
 2020 04 20,
 Abbiamo escluso la funzione esterna per il conteggio dei record che ora
 viene effettuatata direttamente qui dentro.
 Carichiamo una tabella temporanea con un ID identity(index) che viene poi
 usato per il pagining, questa tabella conterrà tutti i record e in base alla 
 selezione utente faremo pagining senza più eseguire nuovamente l'intera query
 ma usando questa tabella (il campo identity verrà "caricato" seguendo l'ordinamento
 di estrazione che sarà quello definito dall'utente, quindi non sarò più necessario 
 eseguiri l'ordinamento, ma ci appoggeremo a quello)
 2020 04 22
 Eslusa la condizione del like nel where, ora carichiamo una tabella temporanea
 "@searched_IDwarehouse" sulla base del magazzino cercato, e poi mettiamo
 questa tabella in inner join con la tabella stock per filtrare, dopo varie
 verifica questa soluzione migliora di molto le performance
 (NOTA: per aumentare ancora le performances sarebbe necessario mettere
 una dropdown sulla pagina web in modo da arrivare qui filtrando già con gli id)
 2020 04 27
 Eliminata la tabella temporanea per il conteggio dei record, ora effettuiamo il 
 conteggio direttamente nella prima query usando "COUNT(*) OVER ()" che ci restituisce
 in colonna il numero totale dei record che poi mandiamo alla pagina per rendere
 disponibili i link di paginazione all'utente
 2020 08 05
 Aggiunto nella vista l'anno del lotto origine
*/
/*00*/ @IDcompany int, 
/*Filtri su testo solo "like" */
/*01*/ @whdesc nvarchar(100), 
/*02*/ @um nvarchar(3),
/*03*/ @IDlot nvarchar(20),
/*04*/ @IDlot_origine nvarchar(20),
/*05*/ @stepRoll nvarchar(3),
/*06*/ @eur1 nvarchar(3),
/*07*/ @conf_item nvarchar(3),  --2023-01-02
/*08*/ @merged_lot nvarchar(3),  --2023-02-28
/*09*/ @ord_rif nvarchar(100),
/* Filtri testo con like oppure con l'=    */
/*10*/ @item nvarchar(47),
/*11*/ @itemC nvarchar(2),
/*12*/ @itemDesc nvarchar(47),
/*13*/ @itemDescC nvarchar(2),
/*14*/ @lcdesc nvarchar(100),
/*15*/ @lcdescC nvarchar(2),
/* Filtri con i valori numerici */
/*16*/ @la nvarchar(50),
/*17*/ @laC nvarchar(2),
/*18*/ @lu nvarchar(50),
/*19*/ @luC nvarchar(2),
/*20*/ @pz nvarchar(50),
/*21*/ @pzC nvarchar(2),
/*22*/ @de nvarchar(50),
/*23*/ @deC nvarchar(2),
/*24*/ @di nvarchar(50),
/*25*/ @diC nvarchar(2),
/*26*/ @ncut nvarchar(50),
/*27*/ @ncutC nvarchar(2),
/*28*/ @qty nvarchar(50),
/*29*/ @qtyC nvarchar(2),
/*30*/ @lotDate nvarchar(50),
/*31*/ @lotDateC nvarchar(2),
/*32*/ @lotOriYear nvarchar(4), --2020 08 05
/*33*/ @lotOriYearC nvarchar(4), --2020 08 05
/* /*34*/ /*35*/ /*36*/ /*37*/ Parametri pagining tabella*/
@page int, @recordPerPage int,@orderBy int, @ascDesc nvarchar(5)
)
returns @TmpTable table(totRecords int, totPages int, /* Dati per il pagining */
						IDlot nvarchar(20), IDlot_origine nvarchar(20), IDitem int, item nvarchar(47), item_desc nvarchar(100), whdesc nvarchar(100), lcdesc nvarchar(100),
						LA float, LU float, PZ float, DE float, DI float,
						cutNum float, qty_stock float, um nvarchar(3), date_lot datetime, lotOriYear int,
						stepRoll nvarchar(3),
						ord_rif nvarchar(100), IDwarehouse int, IDlocation int, note nvarchar(200), 
						IDinventory int, IDstock int, NumComp int,  eur1 nvarchar(3), conf_item nvarchar(3), merged_lot nvarchar(3))
AS
BEGIN
/* Tabelle con singola colonna contenenti solo gli ID dei magazzino\ubicazioni cercati, nella query sotto ci sono le "inner join" per filtrare  */
declare @searched_IDwarehouse table(IDwarehouse int, index IDX_IDwarehouse clustered (IDwarehouse))
declare @searched_IDlocation table(IDlocation int, index IDX_IDlocation clustered (IDlocation))
insert into @searched_IDwarehouse select IDwarehouse from warehouse sw where sw.IDcompany = @IDcompany and dbo.checkValueByCondition('*','char', sw.[desc],@whdesc) = 1
insert into @searched_IDlocation select IDlocation from warehouse_location swl where swl.IDcompany = @IDcompany and dbo.checkValueByCondition(@lcdescC,'char', swl.[desc],@lcdesc) = 1
insert into @TmpTable(totRecords, totPages, IDlot, IDlot_origine, IDitem, item, item_desc, whdesc, lcdesc,
					  LA, LU, PZ, DE, DI, cutNum, qty_stock, 
					  um, date_lot, lotOriYear,
					  stepRoll, ord_rif , 
					  IDwarehouse, IDlocation ,note ,IDinventory ,IDstock ,NumComp ,eur1, conf_item, merged_lot)  /* Tabella temporanea che carico da spedire fuori */
select 
COUNT(*) OVER () as totRecords,							/* 2020-04-27 estrazione del numero totale dei record senza doverli ricontare successivamente */
(
/* Se il risultato della divisione è con la virgola abbiamo dei record nella pagina successiva, quindi mettiamo una pagina agg. che non sarà piena */
case when (cast(COUNT(*) OVER () as decimal) / @recordPerPage)%1 = 0 then (COUNT(*) OVER () / @recordPerPage) else (COUNT(*) OVER () / @recordPerPage) + 1 end
) as totPages,        /* 2020-04-27 Conteggio delle pagine direttamente sulla prima query */
lot.IDlot, lot.IDlot_origine, item.IDitem, item.item, item.item_desc, wh.[desc] as whdesc, wh_lc.[desc] as lcdesc,
isnull(LA,'') as LA, isnull(LU,'') as LU, isnull(PZ,'') as PZ,  isnull(DE,'') as DE, isnull(DI,'') as DI, 
isnull(cuts.Ncut,0) as cutNum, qty_stock, item.um,  
lot.date_lot, year(lotOri.date_lot) as lotOriYear,
case when lot.stepRoll = 0 then 'No' else 'Yes' end as stepRoll,
lot.ord_rif, stock_b.IDwarehouse, stock_b.IDlocation, lot.note
,IDinventory, IDstock, comp.NumComp
,case when lot.eur1 = 0 then 'No' else 'Yes' end as eur1
,case when lot.conf_item = 0 then 'No' else 'Yes' end as conf_item
,case when lot.merged_lot = 0 then 'No' else 'Yes' end as merged_lot
from
	(/*Estrazione primaria dalla sola tabella di stock, le join le uniamo dopo (in modo da ridurre il dataset) */
	SELECT IDcompany, IDlot, stock_base.IDwarehouse, stock_base.IDlocation, qty_stock, IDinventory, IDstock
	from dbo.stock stock_base 
	/* Tabelle usata per FILTRARE sulla base dei magazzini trovati */
	inner join @searched_IDwarehouse swh on swh.IDwarehouse = stock_base.IDwarehouse
	inner join @searched_IDlocation swhl on swhl.IDlocation = stock_base.IDlocation
	where stock_base.IDcompany = @IDcompany
	and dbo.checkValueByCondition('*','char', stock_base.IDlot, @IDlot) = 1) stock_b
inner join dbo.lot on lot.IDcompany = stock_b.IDcompany and lot.IDlot = stock_b.IDlot 
/* 2020 08 08 Aggiunta data lotto origine */
inner join dbo.lot lotOri on lotOri.IDcompany = stock_b.IDcompany and lotOri.IDlot = lot.IDlot_origine
inner join dbo.item on item.IDitem = lot.IDitem 
inner join dbo.warehouse wh on stock_b.IDwarehouse = wh.IDwarehouse 
inner join dbo.warehouse_location wh_lc on stock_b.IDlocation = wh_lc.IDlocation
/* Non tutti gli articoli hanno tutte le dimensioni (2020-04-16 aggiunta pivot sulle dimensioni lotto) 
2020-04-27, usando la pivot usiamo la inner join in quanto tutti i lotti hanno almeno una dimensione */
--2021-03-19, la semplice view sulle dimensioni rallentava drasticamente l'estrazione, con la vista parametrica le perf. sono migliorate
--inner join dbo.vw_lotDimensionsPivot dim on dim.IDcompany = stock.IDcompany and dim.IDlot = stock.IDlot
inner join dbo.parView_lotDimensionsPivot(@IDcompany) dim on dim.IDlot = stock_b.IDlot
/* Viste di appoggio (in precedenza erano subquery, modificate dopo verifica execution plan) */
left outer join dbo.vw_cuts_on_cutting_order cuts on cuts.IDcompany = stock_b.IDcompany and cuts.IDlot = lot.IDlot and cuts.IDlot_new is null /* Ci interessano solo i tagli attivi*/
left outer join dbo.vw_comp_on_production_order comp on comp.IDcompany = stock_b.IDcompany and comp.IDlot = stock_b.IDlot
where stock_b.IDcompany = @IDcompany
/* Filtri testo con like oppure con l'=    */ 
and dbo.checkValueByCondition(@itemC,'char', item, @item) = 1
and dbo.checkValueByCondition(@itemDescC,'char', item_desc, @itemDesc) = 1 
/* Filtri con >, >= ecc .. ci appoggiamo alla funzione per verificare la codizione,
qui non era possibile usare il parametro come condizione(>,<...) */
and dbo.checkValueByCondition(@laC,'float', isnull(LA,''), @la) = 1   
and dbo.checkValueByCondition(@luC,'float', isnull(LU,''), @lu) = 1  
and dbo.checkValueByCondition(@pzC,'float', isnull(PZ,''), @pz) = 1
and dbo.checkValueByCondition(@deC,'float', isnull(DE,''), @de) = 1 
and dbo.checkValueByCondition(@diC,'float', isnull(DI,''), @di) = 1 
and dbo.checkValueByCondition(@ncutC,'float', isnull(cuts.Ncut,0), @ncut) = 1
and dbo.checkValueByCondition(@qtyC,'float', qty_stock, @qty) = 1    
and dbo.checkValueByCondition(@lotDateC,'date', lot.date_lot, @lotDate) = 1 
and dbo.checkValueByCondition(@lotOriYearC,'float', year(lotOri.date_lot), @lotOriYear) = 1  --2020 08 05
/* filtri su testi, eseguiti sempre stile like (senza possibilità di scegliere = o *)*/
and dbo.checkValueByCondition('*','char', um, @um) = 1
and dbo.checkValueByCondition('*','char', lot.IDlot_origine, @IDlot_origine) = 1
and dbo.checkValueByCondition('*','char', lot.ord_rif, @ord_rif) = 1
/*Campi yes no*/
and (@stepRoll				= '' or CHARINDEX(lower(@stepRoll), (case when lot.stepRoll = 0 then 'no' else 'yes' end)) > 0) 
and (@eur1				    = '' or CHARINDEX(lower(@eur1), (case when lot.eur1 = 0 then 'no' else 'yes' end)) > 0)
and (@conf_item				= '' or CHARINDEX(lower(@conf_item), (case when lot.conf_item = 0 then 'no' else 'yes' end)) > 0)
and (@merged_lot			= '' or CHARINDEX(lower(@merged_lot), (case when lot.merged_lot = 0 then 'no' else 'yes' end)) > 0)
order by  
/* Le function non accettano variabile numeriche come parametro di order by,
gestiamo la problematica con l'utilizzo dei case */
case when @orderBy = 1 and @ascDesc = 'asc' then stock_b.IDlot end asc,
case when @orderBy = 1 and @ascDesc = 'desc' then stock_b.IDlot end desc,
case when @orderBy = 2 and @ascDesc = 'asc' then lot.IDlot_origine end asc,
case when @orderBy = 2 and @ascDesc = 'desc' then lot.IDlot_origine end desc,
case when @orderBy = 3 and @ascDesc = 'asc' then item end asc,
case when @orderBy = 3 and @ascDesc = 'desc' then item end desc,
case when @orderBy = 4 and @ascDesc = 'asc' then item_desc  end asc,
case when @orderBy = 4 and @ascDesc = 'desc' then item_desc end desc,
case when @orderBy = 5 and @ascDesc = 'asc' then wh.[desc] end asc,
case when @orderBy = 5 and @ascDesc = 'desc' then wh.[desc] end desc,
case when @orderBy = 6 and @ascDesc = 'asc' then wh_lc.[desc] end asc,
case when @orderBy = 6 and @ascDesc = 'desc' then wh_lc.[desc] end desc,
case when @orderBy = 7 and @ascDesc = 'asc' then isnull(LA,'') end asc,
case when @orderBy = 7 and @ascDesc = 'desc' then isnull(LA,'') end desc,
case when @orderBy = 8 and @ascDesc = 'asc' then isnull(LU,'') end asc, 
case when @orderBy = 8 and @ascDesc = 'desc' then isnull(LU,'') end desc,
case when @orderBy = 9 and @ascDesc = 'asc' then isnull(PZ,'') end asc, 
case when @orderBy = 9 and @ascDesc = 'desc' then isnull(PZ,'') end desc,
case when @orderBy = 10 and @ascDesc = 'asc' then isnull(DE,'') end asc, 
case when @orderBy = 10 and @ascDesc = 'desc' then isnull(DE,'') end desc,
case when @orderBy = 11 and @ascDesc = 'asc' then isnull(DI,'') end asc, 
case when @orderBy = 11 and @ascDesc = 'desc' then isnull(DI,'') end desc,
case when @orderBy = 12 and @ascDesc = 'asc' then (isnull(cuts.Ncut,0)) end asc,
case when @orderBy = 12 and @ascDesc = 'desc' then (isnull(cuts.Ncut,0)) end desc,
case when @orderBy = 13 and @ascDesc = 'asc' then qty_stock end asc,
case when @orderBy = 13 and @ascDesc = 'desc' then qty_stock end desc,
case when @orderBy = 14 and @ascDesc = 'asc' then um end asc,
case when @orderBy = 14 and @ascDesc = 'desc' then um end desc,
case when @orderBy = 15 and @ascDesc = 'asc' then lot.date_lot end asc,
case when @orderBy = 15 and @ascDesc = 'desc' then lot.date_lot end desc,
case when @orderBy = 16 and @ascDesc = 'asc' then year(lotOri.date_lot) end asc,
case when @orderBy = 16 and @ascDesc = 'desc' then year(lotOri.date_lot) end desc,
case when @orderBy = 17 and @ascDesc = 'asc' then lot.stepRoll end asc,
case when @orderBy = 17 and @ascDesc = 'desc' then lot.stepRoll end desc,
case when @orderBy = 18 and @ascDesc = 'asc' then lot.eur1 end asc, 
case when @orderBy = 18 and @ascDesc = 'desc' then lot.eur1 end desc,
case when @orderBy = 19 and @ascDesc = 'asc' then lot.conf_item end asc, 
case when @orderBy = 19 and @ascDesc = 'desc' then lot.conf_item end desc,
case when @orderBy = 20 and @ascDesc = 'asc' then lot.ord_rif end asc, 
case when @orderBy = 20 and @ascDesc = 'desc' then lot.ord_rif end desc
offset (@recordPerPage * (
@page  /* Numero di pagina selezionata dall'utente */
-1)) /* Attenzione, la paginazione inizia con lo 0 */ 
rows fetch next @recordPerPage rows only
RETURN
end;
GO
/****** Object:  UserDefinedFunction [dbo].[parView_pag_stockViewer_20200422]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE FUNCTION [dbo].[parView_pag_stockViewer_20200422] (
/* 2020 02 07, 
 funzione per l'estrazione dati della pagina stock viewer.
 Questa funzione estrae paginando l'estrazione, per lanciare la funzione:
select * from [dbo].[parView_pag_StockViewer]
(845, 
'Villeneuve','','','','','','', --Filtri su testo solo "like"
'','*','','*','','*',  --Filtri testo con like oppure con l'=    
'100','>','','*','','*', '','*','','*', '','*', '','*', '','=',  --Parametri pagining tabella
1,20,7,'desc' )
 2020 04 03,
 Abbiamo escluso la vista (vw_stock_viewer) all'interno di questa function per 
 questioni di performances inserendo direttamente la query, la vecchia view
 rimane utilizzata per l'estrazione completa dello stock su excel con la 
 pagina web report_service_export_stock_all.php (se vengono effettuate modifiche
 all'interno di questa function è necessario valutare la modifica anche 
 della vecchia vista)
 2020 04 20,
 Abbiamo escluso la funzione esterna per il conteggio dei record che ora
 viene effettuatata direttamente qui dentro.
 Carichiamo una tabella temporanea con un ID identity(index) che viene poi
 usato per il pagining, questa tabella conterrà tutti i record e in base alla 
 selezione utente faremo pagining senza più eseguire nuovamente l'intera query
 ma usando questa tabella (il campo identity verrà "caricato" seguendo l'ordinamento
 di estrazione che sarà quello definito dall'utente, quindi non sarò più necessario 
 eseguiri l'ordinamento, ma ci appoggeremo a quello)
*/
/*00*/ @IDcompany int, 
/*Filtri su testo solo "like" */
/*01*/ @whdesc nvarchar(100), 
/*02*/ @um nvarchar(3),
/*03*/ @IDlot nvarchar(20),
/*04*/ @IDlot_origine nvarchar(20),
/*05*/ @stepRoll nvarchar(3),
/*06*/ @eur1 nvarchar(3),
/*07*/ @ord_rif nvarchar(100),
/* Filtri testo con like oppure con l'=    */
/*08*/ @item nvarchar(47),
/*09*/ @itemC nvarchar(2),
/*10*/ @itemDesc nvarchar(47),
/*11*/ @itemDescC nvarchar(2),
/*12*/ @lcdesc nvarchar(100),
/*13*/ @lcdescC nvarchar(2),
/* Filtri con i valori numerici */
/*14*/ @la nvarchar(50),
/*15*/ @laC nvarchar(2),
/*16*/ @lu nvarchar(50),
/*17*/ @luC nvarchar(2),
/*18*/ @pz nvarchar(50),
/*19*/ @pzC nvarchar(2),
/*20*/ @de nvarchar(50),
/*21*/ @deC nvarchar(2),
/*22*/ @di nvarchar(50),
/*23*/ @diC nvarchar(2),
/*24*/ @ncut nvarchar(50),
/*25*/ @ncutC nvarchar(2),
/*26*/ @qty nvarchar(50),
/*27*/ @qtyC nvarchar(2),
/*28*/ @lotDate nvarchar(50),
/*29*/ @lotDateC nvarchar(2),
/* /*30*/ /*31*/ /*32*/ /*33*/ Parametri pagining tabella*/
@page int, @recordPerPage int,@orderBy int, @ascDesc nvarchar(5)
)
returns @PagTable table(totRecords int, totPages int, /* Dati per il pagining */
						IDlot nvarchar(20), IDlot_origine nvarchar(20), item nvarchar(47), item_desc nvarchar(100), whdesc nvarchar(100), lcdesc nvarchar(100),
						LA float, LU float, PZ float, DE float, DI float,
						cutNum float, qty_stock float, um nvarchar(3), date_lot datetime, 
						stepRoll nvarchar(3),
						ord_rif nvarchar(100), IDwarehouse int, IDlocation int, note nvarchar(200), 
						IDinventory int, IDstock int, NumComp int,  eur1 nvarchar(3))
AS
BEGIN
declare @TmpTable table(rownr int identity(1,1), /* Indice di righe per sfruttare l'order by della prima query */
						IDlot nvarchar(20), IDlot_origine nvarchar(20), item nvarchar(47), item_desc nvarchar(100), whdesc nvarchar(100), lcdesc nvarchar(100),
						LA float, LU float, PZ float, DE float, DI float,
						cutNum float, qty_stock float, um nvarchar(3), date_lot datetime, 
						stepRoll nvarchar(3),
						ord_rif nvarchar(100), IDwarehouse int, IDlocation int, note nvarchar(200), 
						IDinventory int, IDstock int, NumComp int,  eur1 nvarchar(3),
						index IDXrownr clustered (rownr)  /* Indice del campo identity usato per sfruttare l order by */
						)
declare @totRecords int = 0
declare @totPages int = 0
declare @offset int = 0
insert into @TmpTable(IDlot, IDlot_origine, item, item_desc, whdesc, lcdesc,
					  LA, LU, PZ, DE, DI, cutNum, qty_stock, 
					  um, date_lot, stepRoll, ord_rif , 
					  IDwarehouse, IDlocation ,note ,IDinventory ,IDstock ,NumComp ,eur1)  /* Tabella temporanea che carico da spedire fuori */
/* --- # BEGIN: Main query --- */
select lot.IDlot, IDlot_origine, item.item, item.item_desc, wh.[desc] as whdesc, wh_lc.[desc] as lcdesc,
isnull(LA,'') as LA, isnull(LU,'') as LU, isnull(PZ,'') as PZ,  isnull(DE,'') as DE, isnull(DI,'') as DI, 
isnull(cuts.Ncut,0) as cutNum, qty_stock, item.um,  
lot.date_lot, 
case when stepRoll = 0 then 'No' else 'Yes' end as stepRoll,
lot.ord_rif, stock.IDwarehouse, stock.IDlocation, lot.note
,IDinventory, IDstock, comp.NumComp
,case when lot.eur1 = 0 then 'No' else 'Yes' end as eur1
from dbo.stock 
inner join lot on lot.IDcompany = stock.IDcompany and lot.IDlot = stock.IDlot 
inner join item on item.IDitem = lot.IDitem 
inner join warehouse wh on wh.IDcompany = stock.IDcompany and stock.IDwarehouse = wh.IDwarehouse 
inner join warehouse_location wh_lc on wh_lc.IDcompany = stock.IDcompany and stock.IDlocation = wh_lc.IDlocation
/* Non tutti gli articoli hanno tutte le dimensioni (2020-04-16 aggiunta pivot sulle dimensioni lotto) */
left outer join dbo.vw_lotDimensionsPivot dim on dim.IDcompany = stock.IDcompany and dim.IDlot = stock.IDlot
/* Viste di appoggio (in precedenza erano subquery, modificate dopo verifica execution plan) */
left outer join dbo.vw_cuts_on_cutting_order cuts on cuts.IDcompany = stock.IDcompany and cuts.IDlot = lot.IDlot
left outer join dbo.vw_comp_on_production_order comp on comp.IDcompany = comp.IDcompany and comp.IDlot = stock.IDlot
where stock.IDcompany = @IDcompany
/* Filtri testo con like oppure con l'=    */ 
and dbo.checkValueByCondition(@itemC,'char', item, @item) = 1
and dbo.checkValueByCondition(@itemDescC,'char', item_desc, @itemDesc) = 1 
and dbo.checkValueByCondition(@lcdescC,'char', wh_lc.[desc],@lcdesc) = 1
/* Filtri con >, >= ecc .. ci appoggiamo alla funzione per verificare la codizione,
qui non era possibile usare il parametro come condizione(>,<...) */
and dbo.checkValueByCondition(@laC,'float', isnull(LA,''), @la) = 1   
and dbo.checkValueByCondition(@luC,'float', isnull(LU,''), @lu) = 1  
and dbo.checkValueByCondition(@pzC,'float', isnull(PZ,''), @pz) = 1
and dbo.checkValueByCondition(@deC,'float', isnull(DE,''), @de) = 1 
and dbo.checkValueByCondition(@diC,'float', isnull(DI,''), @di) = 1 
and dbo.checkValueByCondition(@ncutC,'float', isnull(cuts.Ncut,0), @ncut) = 1
and dbo.checkValueByCondition(@qtyC,'float', qty_stock, @qty) = 1    
and dbo.checkValueByCondition(@lotDateC,'date', date_lot, @lotDate) = 1 
/* filtri su testi, eseguiti sempre stile like (senza possibilità di scegliere = o *)*/
and dbo.checkValueByCondition('*','char', wh.[desc],@whdesc) = 1
and dbo.checkValueByCondition('*','char', um, @um) = 1
and dbo.checkValueByCondition('*','char', stock.IDlot, @IDlot) = 1
and dbo.checkValueByCondition('*','char', IDlot_origine, @IDlot_origine) = 1
and dbo.checkValueByCondition('*','char', ord_rif, @ord_rif) = 1
/*Campi yes no*/
and (@stepRoll				= '' or CHARINDEX(lower(@stepRoll), (case when lot.stepRoll = 0 then 'no' else 'yes' end)) > 0) 
and (@eur1				    = '' or CHARINDEX(lower(@eur1), (case when lot.eur1 = 0 then 'no' else 'yes' end)) > 0)
order by  
/* Le function non accettano variabile numeriche come parametro di order by,
gestiamo la problematica con l'utilizzo dei case */
case when @orderBy = 1 and @ascDesc = 'asc' then stock.IDlot end asc,
case when @orderBy = 1 and @ascDesc = 'desc' then stock.IDlot end desc,
case when @orderBy = 2 and @ascDesc = 'asc' then IDlot_origine end asc,
case when @orderBy = 2 and @ascDesc = 'desc' then IDlot_origine end desc,
case when @orderBy = 3 and @ascDesc = 'asc' then item end asc,
case when @orderBy = 3 and @ascDesc = 'desc' then item end desc,
case when @orderBy = 4 and @ascDesc = 'asc' then item_desc  end asc,
case when @orderBy = 4 and @ascDesc = 'desc' then item_desc end desc,
case when @orderBy = 5 and @ascDesc = 'asc' then wh.[desc] end asc,
case when @orderBy = 5 and @ascDesc = 'desc' then wh.[desc] end desc,
case when @orderBy = 6 and @ascDesc = 'asc' then wh_lc.[desc] end asc,
case when @orderBy = 6 and @ascDesc = 'desc' then wh_lc.[desc] end desc,
case when @orderBy = 7 and @ascDesc = 'asc' then isnull(LA,'') end asc,
case when @orderBy = 7 and @ascDesc = 'desc' then isnull(LA,'') end desc,
case when @orderBy = 8 and @ascDesc = 'asc' then isnull(LU,'') end asc, 
case when @orderBy = 8 and @ascDesc = 'desc' then isnull(LU,'') end desc,
case when @orderBy = 9 and @ascDesc = 'asc' then isnull(PZ,'') end asc, 
case when @orderBy = 9 and @ascDesc = 'desc' then isnull(PZ,'') end desc,
case when @orderBy = 10 and @ascDesc = 'asc' then isnull(DE,'') end asc, 
case when @orderBy = 10 and @ascDesc = 'desc' then isnull(DE,'') end desc,
case when @orderBy = 11 and @ascDesc = 'asc' then isnull(DI,'') end asc, 
case when @orderBy = 11 and @ascDesc = 'desc' then isnull(DI,'') end desc,
case when @orderBy = 12 and @ascDesc = 'asc' then (isnull(cuts.Ncut,0)) end asc,
case when @orderBy = 12 and @ascDesc = 'desc' then (isnull(cuts.Ncut,0)) end desc,
case when @orderBy = 13 and @ascDesc = 'asc' then qty_stock end asc,
case when @orderBy = 13 and @ascDesc = 'desc' then qty_stock end desc,
case when @orderBy = 14 and @ascDesc = 'asc' then um end asc,
case when @orderBy = 14 and @ascDesc = 'desc' then um end desc,
case when @orderBy = 15 and @ascDesc = 'asc' then date_lot end asc,
case when @orderBy = 15 and @ascDesc = 'desc' then date_lot end desc,
case when @orderBy = 16 and @ascDesc = 'asc' then stepRoll end asc,
case when @orderBy = 16 and @ascDesc = 'desc' then stepRoll end desc,
case when @orderBy = 17 and @ascDesc = 'asc' then ord_rif end asc, 
case when @orderBy = 17 and @ascDesc = 'desc' then ord_rif end desc
/* --- # END : Main query ---*/
/* Conteggio record per pagine */
set @totRecords = (select count(IDlot) from  @TmpTable)
set @totPages = (@totRecords / @recordPerPage) + 1
if (@page > @totPages) begin set @page = 1 end /* Se il numero di pagina è maggiore di quelli esistenti setto la pagina 1 */
set @offset = @recordPerPage * (@page - 1);
/* Caricamento della tabella finale da spedire al client */
insert into @PagTable 
select @totRecords , @totPages, 
IDlot, IDlot_origine, item, item_desc, whdesc, lcdesc,
					  LA, LU, PZ, DE, DI, cutNum, qty_stock, 
					  um, date_lot, stepRoll, ord_rif , 
					  IDwarehouse, IDlocation ,note ,IDinventory ,IDstock ,NumComp ,eur1
from  @TmpTable order by rownr asc offset @offset rows fetch next @recordPerPage rows only
RETURN
end;
GO
/****** Object:  UserDefinedFunction [dbo].[parView_pag_stockViewer_20200427]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_pag_stockViewer_20200427] (
/* 2020 02 07, 
 funzione per l'estrazione dati della pagina stock viewer.
 Questa funzione estrae paginando l'estrazione, per lanciare la funzione:
select * from [dbo].[parView_pag_StockViewer]
(845, 
'Villeneuve','','','','','','', --Filtri su testo solo "like"
'','*','','*','','*',  --Filtri testo con like oppure con l'=    
'100','>','','*','','*', '','*','','*', '','*', '','*', '','=',  --Parametri pagining tabella
1,20,7,'desc' )
 2020 04 03,
 Abbiamo escluso la vista (vw_stock_viewer) all'interno di questa function per 
 questioni di performances inserendo direttamente la query, la vecchia view
 rimane utilizzata per l'estrazione completa dello stock su excel con la 
 pagina web report_service_export_stock_all.php (se vengono effettuate modifiche
 all'interno di questa function è necessario valutare la modifica anche 
 della vecchia vista)
 2020 04 20,
 Abbiamo escluso la funzione esterna per il conteggio dei record che ora
 viene effettuatata direttamente qui dentro.
 Carichiamo una tabella temporanea con un ID identity(index) che viene poi
 usato per il pagining, questa tabella conterrà tutti i record e in base alla 
 selezione utente faremo pagining senza più eseguire nuovamente l'intera query
 ma usando questa tabella (il campo identity verrà "caricato" seguendo l'ordinamento
 di estrazione che sarà quello definito dall'utente, quindi non sarò più necessario 
 eseguiri l'ordinamento, ma ci appoggeremo a quello)
 2020 04 22
 Eslusa la condizione del like nel where, ora carichiamo una tabella temporanea
 "@searched_IDwarehouse" sulla base del magazzino cercato, e poi mettiamo
 questa tabella in inner join con la tabella stock per filtrare, dopo varie
 verifica questa soluzione migliora di molto le performance
 (NOTA: per aumentare ancora le performances sarebbe necessario mettere
 una dropdown sulla pagina web in modo da arrivare qui filtrando già con gli id)
*/
/*00*/ @IDcompany int, 
/*Filtri su testo solo "like" */
/*01*/ @whdesc nvarchar(100), 
/*02*/ @um nvarchar(3),
/*03*/ @IDlot nvarchar(20),
/*04*/ @IDlot_origine nvarchar(20),
/*05*/ @stepRoll nvarchar(3),
/*06*/ @eur1 nvarchar(3),
/*07*/ @ord_rif nvarchar(100),
/* Filtri testo con like oppure con l'=    */
/*08*/ @item nvarchar(47),
/*09*/ @itemC nvarchar(2),
/*10*/ @itemDesc nvarchar(47),
/*11*/ @itemDescC nvarchar(2),
/*12*/ @lcdesc nvarchar(100),
/*13*/ @lcdescC nvarchar(2),
/* Filtri con i valori numerici */
/*14*/ @la nvarchar(50),
/*15*/ @laC nvarchar(2),
/*16*/ @lu nvarchar(50),
/*17*/ @luC nvarchar(2),
/*18*/ @pz nvarchar(50),
/*19*/ @pzC nvarchar(2),
/*20*/ @de nvarchar(50),
/*21*/ @deC nvarchar(2),
/*22*/ @di nvarchar(50),
/*23*/ @diC nvarchar(2),
/*24*/ @ncut nvarchar(50),
/*25*/ @ncutC nvarchar(2),
/*26*/ @qty nvarchar(50),
/*27*/ @qtyC nvarchar(2),
/*28*/ @lotDate nvarchar(50),
/*29*/ @lotDateC nvarchar(2),
/* /*30*/ /*31*/ /*32*/ /*33*/ Parametri pagining tabella*/
@page int, @recordPerPage int,@orderBy int, @ascDesc nvarchar(5)
)
returns @PagTable table(totRecords int, totPages int, /* Dati per il pagining */
						IDlot nvarchar(20), IDlot_origine nvarchar(20), item nvarchar(47), item_desc nvarchar(100), whdesc nvarchar(100), lcdesc nvarchar(100),
						LA float, LU float, PZ float, DE float, DI float,
						cutNum float, qty_stock float, um nvarchar(3), date_lot datetime, 
						stepRoll nvarchar(3),
						ord_rif nvarchar(100), IDwarehouse int, IDlocation int, note nvarchar(200), 
						IDinventory int, IDstock int, NumComp int,  eur1 nvarchar(3))
AS
BEGIN
declare @TmpTable table(rownr int identity(1,1), /* Indice di righe per sfruttare l'order by della prima query */
						IDlot nvarchar(20), IDlot_origine nvarchar(20), item nvarchar(47), item_desc nvarchar(100), whdesc nvarchar(100), lcdesc nvarchar(100),
						LA float, LU float, PZ float, DE float, DI float,
						cutNum float, qty_stock float, um nvarchar(3), date_lot datetime, 
						stepRoll nvarchar(3),
						ord_rif nvarchar(100), IDwarehouse int, IDlocation int, note nvarchar(200), 
						IDinventory int, IDstock int, NumComp int,  eur1 nvarchar(3),
						index IDXrownr clustered (rownr)  /* Indice del campo identity usato per sfruttare l order by */
						)
declare @totRecords int = 0
declare @totPages int = 0
declare @offset int = 0
/* Tabelle con singola colonna contenenti solo gli ID dei magazzino\ubicazioni cercati, nella query sotto ci sono le "inner join" per filtrare  */
declare @searched_IDwarehouse table(IDwarehouse int, index IDX_IDwarehouse clustered (IDwarehouse))
declare @searched_IDlocation table(IDlocation int, index IDX_IDlocation clustered (IDlocation))
insert into @searched_IDwarehouse select IDwarehouse from warehouse sw where sw.IDcompany = @IDcompany and dbo.checkValueByCondition('*','char', sw.[desc],@whdesc) = 1
insert into @searched_IDlocation select IDlocation from warehouse_location swl where swl.IDcompany = @IDcompany and dbo.checkValueByCondition(@lcdescC,'char', swl.[desc],@lcdesc) = 1
insert into @TmpTable(IDlot, IDlot_origine, item, item_desc, whdesc, lcdesc,
					  LA, LU, PZ, DE, DI, cutNum, qty_stock, 
					  um, date_lot, stepRoll, ord_rif , 
					  IDwarehouse, IDlocation ,note ,IDinventory ,IDstock ,NumComp ,eur1)  /* Tabella temporanea che carico da spedire fuori */
/* --- # BEGIN: Main query --- */
select lot.IDlot, IDlot_origine, item.item, item.item_desc, wh.[desc] as whdesc, wh_lc.[desc] as lcdesc,
isnull(LA,'') as LA, isnull(LU,'') as LU, isnull(PZ,'') as PZ,  isnull(DE,'') as DE, isnull(DI,'') as DI, 
isnull(cuts.Ncut,0) as cutNum, qty_stock, item.um,  
lot.date_lot, 
case when stepRoll = 0 then 'No' else 'Yes' end as stepRoll,
lot.ord_rif, stock.IDwarehouse, stock.IDlocation, lot.note
,IDinventory, IDstock, comp.NumComp
,case when lot.eur1 = 0 then 'No' else 'Yes' end as eur1
from dbo.stock 
/* Tabelle usata per FILTRARE sulla base dei magazzini trovati */
inner join @searched_IDwarehouse swh on swh.IDwarehouse = stock.IDwarehouse
inner join @searched_IDlocation swhl on swhl.IDlocation = stock.IDlocation
inner join dbo.lot on lot.IDcompany = stock.IDcompany and lot.IDlot = stock.IDlot 
inner join dbo.item on item.IDitem = lot.IDitem 
inner join dbo.warehouse wh on stock.IDwarehouse = wh.IDwarehouse 
inner join dbo.warehouse_location wh_lc on stock.IDlocation = wh_lc.IDlocation
/* Non tutti gli articoli hanno tutte le dimensioni (2020-04-16 aggiunta pivot sulle dimensioni lotto) 
2020-04-27, usando la pivot usiamo la inner join in quanto tutti i lotti hanno almeno una dimensione */
inner join dbo.vw_lotDimensionsPivot dim on dim.IDcompany = stock.IDcompany and dim.IDlot = stock.IDlot
/* Viste di appoggio (in precedenza erano subquery, modificate dopo verifica execution plan) */
left outer join dbo.vw_cuts_on_cutting_order cuts on cuts.IDcompany = stock.IDcompany and cuts.IDlot = lot.IDlot
left outer join dbo.vw_comp_on_production_order comp on comp.IDcompany = comp.IDcompany and comp.IDlot = stock.IDlot
where stock.IDcompany = @IDcompany
/* Filtri testo con like oppure con l'=    */ 
and dbo.checkValueByCondition(@itemC,'char', item, @item) = 1
and dbo.checkValueByCondition(@itemDescC,'char', item_desc, @itemDesc) = 1 
/* Filtri con >, >= ecc .. ci appoggiamo alla funzione per verificare la codizione,
qui non era possibile usare il parametro come condizione(>,<...) */
and dbo.checkValueByCondition(@laC,'float', isnull(LA,''), @la) = 1   
and dbo.checkValueByCondition(@luC,'float', isnull(LU,''), @lu) = 1  
and dbo.checkValueByCondition(@pzC,'float', isnull(PZ,''), @pz) = 1
and dbo.checkValueByCondition(@deC,'float', isnull(DE,''), @de) = 1 
and dbo.checkValueByCondition(@diC,'float', isnull(DI,''), @di) = 1 
and dbo.checkValueByCondition(@ncutC,'float', isnull(cuts.Ncut,0), @ncut) = 1
and dbo.checkValueByCondition(@qtyC,'float', qty_stock, @qty) = 1    
and dbo.checkValueByCondition(@lotDateC,'date', date_lot, @lotDate) = 1 
/* filtri su testi, eseguiti sempre stile like (senza possibilità di scegliere = o *)*/
and dbo.checkValueByCondition('*','char', um, @um) = 1
and dbo.checkValueByCondition('*','char', stock.IDlot, @IDlot) = 1
and dbo.checkValueByCondition('*','char', IDlot_origine, @IDlot_origine) = 1
and dbo.checkValueByCondition('*','char', ord_rif, @ord_rif) = 1
/*Campi yes no*/
and (@stepRoll				= '' or CHARINDEX(lower(@stepRoll), (case when lot.stepRoll = 0 then 'no' else 'yes' end)) > 0) 
and (@eur1				    = '' or CHARINDEX(lower(@eur1), (case when lot.eur1 = 0 then 'no' else 'yes' end)) > 0)
order by  
/* Le function non accettano variabile numeriche come parametro di order by,
gestiamo la problematica con l'utilizzo dei case */
case when @orderBy = 1 and @ascDesc = 'asc' then stock.IDlot end asc,
case when @orderBy = 1 and @ascDesc = 'desc' then stock.IDlot end desc,
case when @orderBy = 2 and @ascDesc = 'asc' then IDlot_origine end asc,
case when @orderBy = 2 and @ascDesc = 'desc' then IDlot_origine end desc,
case when @orderBy = 3 and @ascDesc = 'asc' then item end asc,
case when @orderBy = 3 and @ascDesc = 'desc' then item end desc,
case when @orderBy = 4 and @ascDesc = 'asc' then item_desc  end asc,
case when @orderBy = 4 and @ascDesc = 'desc' then item_desc end desc,
case when @orderBy = 5 and @ascDesc = 'asc' then wh.[desc] end asc,
case when @orderBy = 5 and @ascDesc = 'desc' then wh.[desc] end desc,
case when @orderBy = 6 and @ascDesc = 'asc' then wh_lc.[desc] end asc,
case when @orderBy = 6 and @ascDesc = 'desc' then wh_lc.[desc] end desc,
case when @orderBy = 7 and @ascDesc = 'asc' then isnull(LA,'') end asc,
case when @orderBy = 7 and @ascDesc = 'desc' then isnull(LA,'') end desc,
case when @orderBy = 8 and @ascDesc = 'asc' then isnull(LU,'') end asc, 
case when @orderBy = 8 and @ascDesc = 'desc' then isnull(LU,'') end desc,
case when @orderBy = 9 and @ascDesc = 'asc' then isnull(PZ,'') end asc, 
case when @orderBy = 9 and @ascDesc = 'desc' then isnull(PZ,'') end desc,
case when @orderBy = 10 and @ascDesc = 'asc' then isnull(DE,'') end asc, 
case when @orderBy = 10 and @ascDesc = 'desc' then isnull(DE,'') end desc,
case when @orderBy = 11 and @ascDesc = 'asc' then isnull(DI,'') end asc, 
case when @orderBy = 11 and @ascDesc = 'desc' then isnull(DI,'') end desc,
case when @orderBy = 12 and @ascDesc = 'asc' then (isnull(cuts.Ncut,0)) end asc,
case when @orderBy = 12 and @ascDesc = 'desc' then (isnull(cuts.Ncut,0)) end desc,
case when @orderBy = 13 and @ascDesc = 'asc' then qty_stock end asc,
case when @orderBy = 13 and @ascDesc = 'desc' then qty_stock end desc,
case when @orderBy = 14 and @ascDesc = 'asc' then um end asc,
case when @orderBy = 14 and @ascDesc = 'desc' then um end desc,
case when @orderBy = 15 and @ascDesc = 'asc' then date_lot end asc,
case when @orderBy = 15 and @ascDesc = 'desc' then date_lot end desc,
case when @orderBy = 16 and @ascDesc = 'asc' then stepRoll end asc,
case when @orderBy = 16 and @ascDesc = 'desc' then stepRoll end desc,
case when @orderBy = 17 and @ascDesc = 'asc' then ord_rif end asc, 
case when @orderBy = 17 and @ascDesc = 'desc' then ord_rif end desc
/* --- # END : Main query ---*/
/* Conteggio record per pagine */
set @totRecords = (select count(IDlot) from  @TmpTable)
set @totPages = (@totRecords / @recordPerPage) + 1
if (@page > @totPages) begin set @page = 1 end /* Se il numero di pagina è maggiore di quelli esistenti setto la pagina 1 */
set @offset = @recordPerPage * (@page - 1)
/* Caricamento della tabella finale da spedire al client */
insert into @PagTable 
select @totRecords , @totPages, 
IDlot, IDlot_origine, item, item_desc, whdesc, lcdesc,
					  LA, LU, PZ, DE, DI, cutNum, qty_stock, 
					  um, date_lot, stepRoll, ord_rif , 
					  IDwarehouse, IDlocation ,note ,IDinventory ,IDstock ,NumComp ,eur1
from  @TmpTable order by rownr asc offset @offset rows fetch next @recordPerPage rows only
RETURN
end;
GO
/****** Object:  UserDefinedFunction [dbo].[parView_pag_stockViewer_20200805]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_pag_stockViewer_20200805] (
/* 2020 02 07, 
 funzione per l'estrazione dati della pagina stock viewer.
 Questa funzione estrae paginando l'estrazione, per lanciare la funzione:
select * from [dbo].[parView_pag_StockViewer]
(845, 
'Villeneuve','','','','','','', --Filtri su testo solo "like"
'','*','','*','','*',  --Filtri testo con like oppure con l'=    
'100','>','','*','','*', '','*','','*', '','*', '','*', '','=',  --Parametri pagining tabella
1,20,7,'desc' )
 2020 04 03,
 Abbiamo escluso la vista (vw_stock_viewer) all'interno di questa function per 
 questioni di performances inserendo direttamente la query, la vecchia view
 rimane utilizzata per l'estrazione completa dello stock su excel con la 
 pagina web report_service_export_stock_all.php (se vengono effettuate modifiche
 all'interno di questa function è necessario valutare la modifica anche 
 della vecchia vista)
 2020 04 20,
 Abbiamo escluso la funzione esterna per il conteggio dei record che ora
 viene effettuatata direttamente qui dentro.
 Carichiamo una tabella temporanea con un ID identity(index) che viene poi
 usato per il pagining, questa tabella conterrà tutti i record e in base alla 
 selezione utente faremo pagining senza più eseguire nuovamente l'intera query
 ma usando questa tabella (il campo identity verrà "caricato" seguendo l'ordinamento
 di estrazione che sarà quello definito dall'utente, quindi non sarò più necessario 
 eseguiri l'ordinamento, ma ci appoggeremo a quello)
 2020 04 22
 Eslusa la condizione del like nel where, ora carichiamo una tabella temporanea
 "@searched_IDwarehouse" sulla base del magazzino cercato, e poi mettiamo
 questa tabella in inner join con la tabella stock per filtrare, dopo varie
 verifica questa soluzione migliora di molto le performance
 (NOTA: per aumentare ancora le performances sarebbe necessario mettere
 una dropdown sulla pagina web in modo da arrivare qui filtrando già con gli id)
 2020 04 27
 Eliminata la tabella temporanea per il conteggio dei record, ora effettuiamo il 
 conteggio direttamente nella prima query usando "COUNT(*) OVER ()" che ci restituisce
 in colonna il numero totale dei record che poi mandiamo alla pagina per rendere
 disponibili i link di paginazione all'utente
*/
/*00*/ @IDcompany int, 
/*Filtri su testo solo "like" */
/*01*/ @whdesc nvarchar(100), 
/*02*/ @um nvarchar(3),
/*03*/ @IDlot nvarchar(20),
/*04*/ @IDlot_origine nvarchar(20),
/*05*/ @stepRoll nvarchar(3),
/*06*/ @eur1 nvarchar(3),
/*07*/ @ord_rif nvarchar(100),
/* Filtri testo con like oppure con l'=    */
/*08*/ @item nvarchar(47),
/*09*/ @itemC nvarchar(2),
/*10*/ @itemDesc nvarchar(47),
/*11*/ @itemDescC nvarchar(2),
/*12*/ @lcdesc nvarchar(100),
/*13*/ @lcdescC nvarchar(2),
/* Filtri con i valori numerici */
/*14*/ @la nvarchar(50),
/*15*/ @laC nvarchar(2),
/*16*/ @lu nvarchar(50),
/*17*/ @luC nvarchar(2),
/*18*/ @pz nvarchar(50),
/*19*/ @pzC nvarchar(2),
/*20*/ @de nvarchar(50),
/*21*/ @deC nvarchar(2),
/*22*/ @di nvarchar(50),
/*23*/ @diC nvarchar(2),
/*24*/ @ncut nvarchar(50),
/*25*/ @ncutC nvarchar(2),
/*26*/ @qty nvarchar(50),
/*27*/ @qtyC nvarchar(2),
/*28*/ @lotDate nvarchar(50),
/*29*/ @lotDateC nvarchar(2),
/* /*30*/ /*31*/ /*32*/ /*33*/ Parametri pagining tabella*/
@page int, @recordPerPage int,@orderBy int, @ascDesc nvarchar(5)
)
returns @TmpTable table(totRecords int, totPages int, /* Dati per il pagining */
						IDlot nvarchar(20), IDlot_origine nvarchar(20), item nvarchar(47), item_desc nvarchar(100), whdesc nvarchar(100), lcdesc nvarchar(100),
						LA float, LU float, PZ float, DE float, DI float,
						cutNum float, qty_stock float, um nvarchar(3), date_lot datetime, 
						stepRoll nvarchar(3),
						ord_rif nvarchar(100), IDwarehouse int, IDlocation int, note nvarchar(200), 
						IDinventory int, IDstock int, NumComp int,  eur1 nvarchar(3))
AS
BEGIN
/* Tabelle con singola colonna contenenti solo gli ID dei magazzino\ubicazioni cercati, nella query sotto ci sono le "inner join" per filtrare  */
declare @searched_IDwarehouse table(IDwarehouse int, index IDX_IDwarehouse clustered (IDwarehouse))
declare @searched_IDlocation table(IDlocation int, index IDX_IDlocation clustered (IDlocation))
insert into @searched_IDwarehouse select IDwarehouse from warehouse sw where sw.IDcompany = @IDcompany and dbo.checkValueByCondition('*','char', sw.[desc],@whdesc) = 1
insert into @searched_IDlocation select IDlocation from warehouse_location swl where swl.IDcompany = @IDcompany and dbo.checkValueByCondition(@lcdescC,'char', swl.[desc],@lcdesc) = 1
insert into @TmpTable(totRecords, totPages, IDlot, IDlot_origine, item, item_desc, whdesc, lcdesc,
					  LA, LU, PZ, DE, DI, cutNum, qty_stock, 
					  um, date_lot, stepRoll, ord_rif , 
					  IDwarehouse, IDlocation ,note ,IDinventory ,IDstock ,NumComp ,eur1)  /* Tabella temporanea che carico da spedire fuori */
select 
COUNT(*) OVER () as totRecords,							/* 2020-04-27 estrazione del numero totale dei record senza doverli ricontare successivamente */
(
/* Se il risultato della divisione è con la virgola abbiamo dei record nella pagina successiva, quindi mettiamo una pagina agg. che non sarà piena */
case when (cast(COUNT(*) OVER () as decimal) / @recordPerPage)%1 = 0 then (COUNT(*) OVER () / @recordPerPage) else (COUNT(*) OVER () / @recordPerPage) + 1 end
) as totPages,        /* 2020-04-27 Conteggio delle pagine direttamente sulla prima query */
lot.IDlot, IDlot_origine, item.item, item.item_desc, wh.[desc] as whdesc, wh_lc.[desc] as lcdesc,
isnull(LA,'') as LA, isnull(LU,'') as LU, isnull(PZ,'') as PZ,  isnull(DE,'') as DE, isnull(DI,'') as DI, 
isnull(cuts.Ncut,0) as cutNum, qty_stock, item.um,  
lot.date_lot, 
case when stepRoll = 0 then 'No' else 'Yes' end as stepRoll,
lot.ord_rif, stock.IDwarehouse, stock.IDlocation, lot.note
,IDinventory, IDstock, comp.NumComp
,case when lot.eur1 = 0 then 'No' else 'Yes' end as eur1
from dbo.stock 
/* Tabelle usata per FILTRARE sulla base dei magazzini trovati */
inner join @searched_IDwarehouse swh on swh.IDwarehouse = stock.IDwarehouse
inner join @searched_IDlocation swhl on swhl.IDlocation = stock.IDlocation
inner join dbo.lot on lot.IDcompany = stock.IDcompany and lot.IDlot = stock.IDlot 
inner join dbo.item on item.IDitem = lot.IDitem 
inner join dbo.warehouse wh on stock.IDwarehouse = wh.IDwarehouse 
inner join dbo.warehouse_location wh_lc on stock.IDlocation = wh_lc.IDlocation
/* Non tutti gli articoli hanno tutte le dimensioni (2020-04-16 aggiunta pivot sulle dimensioni lotto) 
2020-04-27, usando la pivot usiamo la inner join in quanto tutti i lotti hanno almeno una dimensione */
inner join dbo.vw_lotDimensionsPivot dim on dim.IDcompany = stock.IDcompany and dim.IDlot = stock.IDlot
/* Viste di appoggio (in precedenza erano subquery, modificate dopo verifica execution plan) */
left outer join dbo.vw_cuts_on_cutting_order cuts on cuts.IDcompany = stock.IDcompany and cuts.IDlot = lot.IDlot
left outer join dbo.vw_comp_on_production_order comp on comp.IDcompany = comp.IDcompany and comp.IDlot = stock.IDlot
where stock.IDcompany = @IDcompany
/* Filtri testo con like oppure con l'=    */ 
and dbo.checkValueByCondition(@itemC,'char', item, @item) = 1
and dbo.checkValueByCondition(@itemDescC,'char', item_desc, @itemDesc) = 1 
/* Filtri con >, >= ecc .. ci appoggiamo alla funzione per verificare la codizione,
qui non era possibile usare il parametro come condizione(>,<...) */
and dbo.checkValueByCondition(@laC,'float', isnull(LA,''), @la) = 1   
and dbo.checkValueByCondition(@luC,'float', isnull(LU,''), @lu) = 1  
and dbo.checkValueByCondition(@pzC,'float', isnull(PZ,''), @pz) = 1
and dbo.checkValueByCondition(@deC,'float', isnull(DE,''), @de) = 1 
and dbo.checkValueByCondition(@diC,'float', isnull(DI,''), @di) = 1 
and dbo.checkValueByCondition(@ncutC,'float', isnull(cuts.Ncut,0), @ncut) = 1
and dbo.checkValueByCondition(@qtyC,'float', qty_stock, @qty) = 1    
and dbo.checkValueByCondition(@lotDateC,'date', date_lot, @lotDate) = 1 
/* filtri su testi, eseguiti sempre stile like (senza possibilità di scegliere = o *)*/
and dbo.checkValueByCondition('*','char', um, @um) = 1
and dbo.checkValueByCondition('*','char', stock.IDlot, @IDlot) = 1
and dbo.checkValueByCondition('*','char', IDlot_origine, @IDlot_origine) = 1
and dbo.checkValueByCondition('*','char', ord_rif, @ord_rif) = 1
/*Campi yes no*/
and (@stepRoll				= '' or CHARINDEX(lower(@stepRoll), (case when lot.stepRoll = 0 then 'no' else 'yes' end)) > 0) 
and (@eur1				    = '' or CHARINDEX(lower(@eur1), (case when lot.eur1 = 0 then 'no' else 'yes' end)) > 0)
order by  
/* Le function non accettano variabile numeriche come parametro di order by,
gestiamo la problematica con l'utilizzo dei case */
case when @orderBy = 1 and @ascDesc = 'asc' then stock.IDlot end asc,
case when @orderBy = 1 and @ascDesc = 'desc' then stock.IDlot end desc,
case when @orderBy = 2 and @ascDesc = 'asc' then IDlot_origine end asc,
case when @orderBy = 2 and @ascDesc = 'desc' then IDlot_origine end desc,
case when @orderBy = 3 and @ascDesc = 'asc' then item end asc,
case when @orderBy = 3 and @ascDesc = 'desc' then item end desc,
case when @orderBy = 4 and @ascDesc = 'asc' then item_desc  end asc,
case when @orderBy = 4 and @ascDesc = 'desc' then item_desc end desc,
case when @orderBy = 5 and @ascDesc = 'asc' then wh.[desc] end asc,
case when @orderBy = 5 and @ascDesc = 'desc' then wh.[desc] end desc,
case when @orderBy = 6 and @ascDesc = 'asc' then wh_lc.[desc] end asc,
case when @orderBy = 6 and @ascDesc = 'desc' then wh_lc.[desc] end desc,
case when @orderBy = 7 and @ascDesc = 'asc' then isnull(LA,'') end asc,
case when @orderBy = 7 and @ascDesc = 'desc' then isnull(LA,'') end desc,
case when @orderBy = 8 and @ascDesc = 'asc' then isnull(LU,'') end asc, 
case when @orderBy = 8 and @ascDesc = 'desc' then isnull(LU,'') end desc,
case when @orderBy = 9 and @ascDesc = 'asc' then isnull(PZ,'') end asc, 
case when @orderBy = 9 and @ascDesc = 'desc' then isnull(PZ,'') end desc,
case when @orderBy = 10 and @ascDesc = 'asc' then isnull(DE,'') end asc, 
case when @orderBy = 10 and @ascDesc = 'desc' then isnull(DE,'') end desc,
case when @orderBy = 11 and @ascDesc = 'asc' then isnull(DI,'') end asc, 
case when @orderBy = 11 and @ascDesc = 'desc' then isnull(DI,'') end desc,
case when @orderBy = 12 and @ascDesc = 'asc' then (isnull(cuts.Ncut,0)) end asc,
case when @orderBy = 12 and @ascDesc = 'desc' then (isnull(cuts.Ncut,0)) end desc,
case when @orderBy = 13 and @ascDesc = 'asc' then qty_stock end asc,
case when @orderBy = 13 and @ascDesc = 'desc' then qty_stock end desc,
case when @orderBy = 14 and @ascDesc = 'asc' then um end asc,
case when @orderBy = 14 and @ascDesc = 'desc' then um end desc,
case when @orderBy = 15 and @ascDesc = 'asc' then date_lot end asc,
case when @orderBy = 15 and @ascDesc = 'desc' then date_lot end desc,
case when @orderBy = 16 and @ascDesc = 'asc' then stepRoll end asc,
case when @orderBy = 16 and @ascDesc = 'desc' then stepRoll end desc,
case when @orderBy = 17 and @ascDesc = 'asc' then ord_rif end asc, 
case when @orderBy = 17 and @ascDesc = 'desc' then ord_rif end desc
offset (@recordPerPage * (
@page  /* Numero di pagina selezionata dall'utente */
-1)) /* Attenzione, la paginazione inizia con lo 0 */ 
rows fetch next @recordPerPage rows only
RETURN
end;
GO
/****** Object:  UserDefinedFunction [dbo].[parView_pag_stockViewer_20210319]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_pag_stockViewer_20210319] (
/* 2020 02 07, 
 funzione per l'estrazione dati della pagina stock viewer.
 Questa funzione estrae paginando l'estrazione, per lanciare la funzione:
select * from [dbo].[parView_pag_StockViewer]
(845, 
'Villeneuve','','','','','','', --Filtri su testo solo "like"
'','*','','*','','*',  --Filtri testo con like oppure con l'=    
'100','>','','*','','*', '','*','','*', '','*', '','*', '','=',  --Parametri pagining tabella
1,20,7,'desc' )
 2020 04 03,
 Abbiamo escluso la vista (vw_stock_viewer) all'interno di questa function per 
 questioni di performances inserendo direttamente la query, la vecchia view
 rimane utilizzata per l'estrazione completa dello stock su excel con la 
 pagina web report_service_export_stock_all.php (se vengono effettuate modifiche
 all'interno di questa function è necessario valutare la modifica anche 
 della vecchia vista)
 2020 04 20,
 Abbiamo escluso la funzione esterna per il conteggio dei record che ora
 viene effettuatata direttamente qui dentro.
 Carichiamo una tabella temporanea con un ID identity(index) che viene poi
 usato per il pagining, questa tabella conterrà tutti i record e in base alla 
 selezione utente faremo pagining senza più eseguire nuovamente l'intera query
 ma usando questa tabella (il campo identity verrà "caricato" seguendo l'ordinamento
 di estrazione che sarà quello definito dall'utente, quindi non sarò più necessario 
 eseguiri l'ordinamento, ma ci appoggeremo a quello)
 2020 04 22
 Eslusa la condizione del like nel where, ora carichiamo una tabella temporanea
 "@searched_IDwarehouse" sulla base del magazzino cercato, e poi mettiamo
 questa tabella in inner join con la tabella stock per filtrare, dopo varie
 verifica questa soluzione migliora di molto le performance
 (NOTA: per aumentare ancora le performances sarebbe necessario mettere
 una dropdown sulla pagina web in modo da arrivare qui filtrando già con gli id)
 2020 04 27
 Eliminata la tabella temporanea per il conteggio dei record, ora effettuiamo il 
 conteggio direttamente nella prima query usando "COUNT(*) OVER ()" che ci restituisce
 in colonna il numero totale dei record che poi mandiamo alla pagina per rendere
 disponibili i link di paginazione all'utente
 2020 08 05
 Aggiunto nella vista l'anno del lotto origine
*/
/*00*/ @IDcompany int, 
/*Filtri su testo solo "like" */
/*01*/ @whdesc nvarchar(100), 
/*02*/ @um nvarchar(3),
/*03*/ @IDlot nvarchar(20),
/*04*/ @IDlot_origine nvarchar(20),
/*05*/ @stepRoll nvarchar(3),
/*06*/ @eur1 nvarchar(3),
/*07*/ @ord_rif nvarchar(100),
/* Filtri testo con like oppure con l'=    */
/*08*/ @item nvarchar(47),
/*09*/ @itemC nvarchar(2),
/*10*/ @itemDesc nvarchar(47),
/*11*/ @itemDescC nvarchar(2),
/*12*/ @lcdesc nvarchar(100),
/*13*/ @lcdescC nvarchar(2),
/* Filtri con i valori numerici */
/*14*/ @la nvarchar(50),
/*15*/ @laC nvarchar(2),
/*16*/ @lu nvarchar(50),
/*17*/ @luC nvarchar(2),
/*18*/ @pz nvarchar(50),
/*19*/ @pzC nvarchar(2),
/*20*/ @de nvarchar(50),
/*21*/ @deC nvarchar(2),
/*22*/ @di nvarchar(50),
/*23*/ @diC nvarchar(2),
/*24*/ @ncut nvarchar(50),
/*25*/ @ncutC nvarchar(2),
/*26*/ @qty nvarchar(50),
/*27*/ @qtyC nvarchar(2),
/*28*/ @lotDate nvarchar(50),
/*29*/ @lotDateC nvarchar(2),
/*30*/ @lotOriYear nvarchar(4), --2020 08 05
/*31*/ @lotOriYearC nvarchar(4), --2020 08 05
/* /*30*/ /*31*/ /*32*/ /*33*/ Parametri pagining tabella*/
@page int, @recordPerPage int,@orderBy int, @ascDesc nvarchar(5)
)
returns @TmpTable table(totRecords int, totPages int, /* Dati per il pagining */
						IDlot nvarchar(20), IDlot_origine nvarchar(20), item nvarchar(47), item_desc nvarchar(100), whdesc nvarchar(100), lcdesc nvarchar(100),
						LA float, LU float, PZ float, DE float, DI float,
						cutNum float, qty_stock float, um nvarchar(3), date_lot datetime, lotOriYear int,
						stepRoll nvarchar(3),
						ord_rif nvarchar(100), IDwarehouse int, IDlocation int, note nvarchar(200), 
						IDinventory int, IDstock int, NumComp int,  eur1 nvarchar(3))
AS
BEGIN
/* Tabelle con singola colonna contenenti solo gli ID dei magazzino\ubicazioni cercati, nella query sotto ci sono le "inner join" per filtrare  */
declare @searched_IDwarehouse table(IDwarehouse int, index IDX_IDwarehouse clustered (IDwarehouse))
declare @searched_IDlocation table(IDlocation int, index IDX_IDlocation clustered (IDlocation))
insert into @searched_IDwarehouse select IDwarehouse from warehouse sw where sw.IDcompany = @IDcompany and dbo.checkValueByCondition('*','char', sw.[desc],@whdesc) = 1
insert into @searched_IDlocation select IDlocation from warehouse_location swl where swl.IDcompany = @IDcompany and dbo.checkValueByCondition(@lcdescC,'char', swl.[desc],@lcdesc) = 1
insert into @TmpTable(totRecords, totPages, IDlot, IDlot_origine, item, item_desc, whdesc, lcdesc,
					  LA, LU, PZ, DE, DI, cutNum, qty_stock, 
					  um, date_lot, lotOriYear,
					  stepRoll, ord_rif , 
					  IDwarehouse, IDlocation ,note ,IDinventory ,IDstock ,NumComp ,eur1)  /* Tabella temporanea che carico da spedire fuori */
select 
COUNT(*) OVER () as totRecords,							/* 2020-04-27 estrazione del numero totale dei record senza doverli ricontare successivamente */
(
/* Se il risultato della divisione è con la virgola abbiamo dei record nella pagina successiva, quindi mettiamo una pagina agg. che non sarà piena */
case when (cast(COUNT(*) OVER () as decimal) / @recordPerPage)%1 = 0 then (COUNT(*) OVER () / @recordPerPage) else (COUNT(*) OVER () / @recordPerPage) + 1 end
) as totPages,        /* 2020-04-27 Conteggio delle pagine direttamente sulla prima query */
lot.IDlot, lot.IDlot_origine, item.item, item.item_desc, wh.[desc] as whdesc, wh_lc.[desc] as lcdesc,
isnull(LA,'') as LA, isnull(LU,'') as LU, isnull(PZ,'') as PZ,  isnull(DE,'') as DE, isnull(DI,'') as DI, 
isnull(cuts.Ncut,0) as cutNum, qty_stock, item.um,  
lot.date_lot, year(lotOri.date_lot) as lotOriYear,
case when lot.stepRoll = 0 then 'No' else 'Yes' end as stepRoll,
lot.ord_rif, stock.IDwarehouse, stock.IDlocation, lot.note
,IDinventory, IDstock, comp.NumComp
,case when lot.eur1 = 0 then 'No' else 'Yes' end as eur1
from dbo.stock 
/* Tabelle usata per FILTRARE sulla base dei magazzini trovati */
inner join @searched_IDwarehouse swh on swh.IDwarehouse = stock.IDwarehouse
inner join @searched_IDlocation swhl on swhl.IDlocation = stock.IDlocation
inner join dbo.lot on lot.IDcompany = stock.IDcompany and lot.IDlot = stock.IDlot 
/* 2020 08 08 Aggiunta data lotto origine */
inner join dbo.lot lotOri on lotOri.IDcompany = stock.IDcompany and lotOri.IDlot = lot.IDlot_origine
inner join dbo.item on item.IDitem = lot.IDitem 
inner join dbo.warehouse wh on stock.IDwarehouse = wh.IDwarehouse 
inner join dbo.warehouse_location wh_lc on stock.IDlocation = wh_lc.IDlocation
/* Non tutti gli articoli hanno tutte le dimensioni (2020-04-16 aggiunta pivot sulle dimensioni lotto) 
2020-04-27, usando la pivot usiamo la inner join in quanto tutti i lotti hanno almeno una dimensione */
inner join dbo.vw_lotDimensionsPivot dim on dim.IDcompany = stock.IDcompany and dim.IDlot = stock.IDlot
/* Viste di appoggio (in precedenza erano subquery, modificate dopo verifica execution plan) */
left outer join dbo.vw_cuts_on_cutting_order cuts on cuts.IDcompany = stock.IDcompany and cuts.IDlot = lot.IDlot
left outer join dbo.vw_comp_on_production_order comp on comp.IDcompany = comp.IDcompany and comp.IDlot = stock.IDlot
where stock.IDcompany = @IDcompany
/* Filtri testo con like oppure con l'=    */ 
and dbo.checkValueByCondition(@itemC,'char', item, @item) = 1
and dbo.checkValueByCondition(@itemDescC,'char', item_desc, @itemDesc) = 1 
/* Filtri con >, >= ecc .. ci appoggiamo alla funzione per verificare la codizione,
qui non era possibile usare il parametro come condizione(>,<...) */
and dbo.checkValueByCondition(@laC,'float', isnull(LA,''), @la) = 1   
and dbo.checkValueByCondition(@luC,'float', isnull(LU,''), @lu) = 1  
and dbo.checkValueByCondition(@pzC,'float', isnull(PZ,''), @pz) = 1
and dbo.checkValueByCondition(@deC,'float', isnull(DE,''), @de) = 1 
and dbo.checkValueByCondition(@diC,'float', isnull(DI,''), @di) = 1 
and dbo.checkValueByCondition(@ncutC,'float', isnull(cuts.Ncut,0), @ncut) = 1
and dbo.checkValueByCondition(@qtyC,'float', qty_stock, @qty) = 1    
and dbo.checkValueByCondition(@lotDateC,'date', lot.date_lot, @lotDate) = 1 
and dbo.checkValueByCondition(@lotOriYearC,'float', year(lotOri.date_lot), @lotOriYear) = 1  --2020 08 05
/* filtri su testi, eseguiti sempre stile like (senza possibilità di scegliere = o *)*/
and dbo.checkValueByCondition('*','char', um, @um) = 1
and dbo.checkValueByCondition('*','char', stock.IDlot, @IDlot) = 1
and dbo.checkValueByCondition('*','char', lot.IDlot_origine, @IDlot_origine) = 1
and dbo.checkValueByCondition('*','char', lot.ord_rif, @ord_rif) = 1
/*Campi yes no*/
and (@stepRoll				= '' or CHARINDEX(lower(@stepRoll), (case when lot.stepRoll = 0 then 'no' else 'yes' end)) > 0) 
and (@eur1				    = '' or CHARINDEX(lower(@eur1), (case when lot.eur1 = 0 then 'no' else 'yes' end)) > 0)
order by  
/* Le function non accettano variabile numeriche come parametro di order by,
gestiamo la problematica con l'utilizzo dei case */
case when @orderBy = 1 and @ascDesc = 'asc' then stock.IDlot end asc,
case when @orderBy = 1 and @ascDesc = 'desc' then stock.IDlot end desc,
case when @orderBy = 2 and @ascDesc = 'asc' then lot.IDlot_origine end asc,
case when @orderBy = 2 and @ascDesc = 'desc' then lot.IDlot_origine end desc,
case when @orderBy = 3 and @ascDesc = 'asc' then item end asc,
case when @orderBy = 3 and @ascDesc = 'desc' then item end desc,
case when @orderBy = 4 and @ascDesc = 'asc' then item_desc  end asc,
case when @orderBy = 4 and @ascDesc = 'desc' then item_desc end desc,
case when @orderBy = 5 and @ascDesc = 'asc' then wh.[desc] end asc,
case when @orderBy = 5 and @ascDesc = 'desc' then wh.[desc] end desc,
case when @orderBy = 6 and @ascDesc = 'asc' then wh_lc.[desc] end asc,
case when @orderBy = 6 and @ascDesc = 'desc' then wh_lc.[desc] end desc,
case when @orderBy = 7 and @ascDesc = 'asc' then isnull(LA,'') end asc,
case when @orderBy = 7 and @ascDesc = 'desc' then isnull(LA,'') end desc,
case when @orderBy = 8 and @ascDesc = 'asc' then isnull(LU,'') end asc, 
case when @orderBy = 8 and @ascDesc = 'desc' then isnull(LU,'') end desc,
case when @orderBy = 9 and @ascDesc = 'asc' then isnull(PZ,'') end asc, 
case when @orderBy = 9 and @ascDesc = 'desc' then isnull(PZ,'') end desc,
case when @orderBy = 10 and @ascDesc = 'asc' then isnull(DE,'') end asc, 
case when @orderBy = 10 and @ascDesc = 'desc' then isnull(DE,'') end desc,
case when @orderBy = 11 and @ascDesc = 'asc' then isnull(DI,'') end asc, 
case when @orderBy = 11 and @ascDesc = 'desc' then isnull(DI,'') end desc,
case when @orderBy = 12 and @ascDesc = 'asc' then (isnull(cuts.Ncut,0)) end asc,
case when @orderBy = 12 and @ascDesc = 'desc' then (isnull(cuts.Ncut,0)) end desc,
case when @orderBy = 13 and @ascDesc = 'asc' then qty_stock end asc,
case when @orderBy = 13 and @ascDesc = 'desc' then qty_stock end desc,
case when @orderBy = 14 and @ascDesc = 'asc' then um end asc,
case when @orderBy = 14 and @ascDesc = 'desc' then um end desc,
case when @orderBy = 15 and @ascDesc = 'asc' then lot.date_lot end asc,
case when @orderBy = 15 and @ascDesc = 'desc' then lot.date_lot end desc,
case when @orderBy = 16 and @ascDesc = 'asc' then year(lotOri.date_lot) end asc,
case when @orderBy = 16 and @ascDesc = 'desc' then year(lotOri.date_lot) end desc,
case when @orderBy = 17 and @ascDesc = 'asc' then lot.stepRoll end asc,
case when @orderBy = 17 and @ascDesc = 'desc' then lot.stepRoll end desc,
case when @orderBy = 18 and @ascDesc = 'asc' then lot.ord_rif end asc, 
case when @orderBy = 18 and @ascDesc = 'desc' then lot.ord_rif end desc
offset (@recordPerPage * (
@page  /* Numero di pagina selezionata dall'utente */
-1)) /* Attenzione, la paginazione inizia con lo 0 */ 
rows fetch next @recordPerPage rows only
RETURN
end;
GO
/****** Object:  UserDefinedFunction [dbo].[parView_SelectItemCount]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_SelectItemCount] (
@IDcompany int,
/*Filtri su testo solo "like" */
@item nvarchar(47), 
@desc nvarchar(100)
)
/*
Utilizzata in 
- receipt_select_item.php
- adjustments_select_item.php
*/
RETURNS int
AS BEGIN
DECLARE @NumRecords int = 0
set @NumRecords = 
(select count(*) from parView_SelectItem(@IDcompany, @item, @desc, 0,999999))
    RETURN @NumRecords
END;
GO
/****** Object:  UserDefinedFunction [dbo].[parView_SelectSupplierCount]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_SelectSupplierCount] (
@IDcompany int,
/*Filtri su testo solo "like" */
@BPdesc nvarchar(100)
)

RETURNS int
AS BEGIN
DECLARE @NumRecords int = 0
set @NumRecords = 
(select count(*) from parView_SelectSupplier(@IDcompany, @BPdesc,0,999999))
    RETURN @NumRecords
END;
GO
/****** Object:  UserDefinedFunction [dbo].[parView_StockViewerCount]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_StockViewerCount] (
/* 2020 02 07, 
 questa funzione viene utilizzata solo ed esclusivamente appogiandosi
 alla parView_StockViewer per effettuare il conteggio del numero totale
 dei secord estratti considerando i filtri impostati, in modo 
 da effettuare il pagining corretto della pagina
*/

@IDcompany int,
/*Filtri su testo solo "like" */
@whdesc nvarchar(100), 
@um nvarchar(3),
@IDlot nvarchar(20),
@IDlot_origine nvarchar(20),
@stepRoll nvarchar(3),
@eur1 nvarchar(3),
@ord_rif nvarchar(100),
/* Filtri testo con like oppure con l'=    */
@item nvarchar(47),
@itemC nvarchar(2),
@itemDesc nvarchar(47),
@itemDescC nvarchar(2),
@lcdesc nvarchar(100),
@lcdescC nvarchar(2),
/* Filtri con i valori numerici */
@la nvarchar(50),
@laC nvarchar(2),
@lu nvarchar(50),
@luC nvarchar(2),
@pz nvarchar(50),
@pzC nvarchar(2),
@de nvarchar(50),
@deC nvarchar(2),
@di nvarchar(50),
@diC nvarchar(2),
@ncut nvarchar(50),
@ncutC nvarchar(2),
@qty nvarchar(50),
@qtyC nvarchar(2),
@lotDate nvarchar(50),
@lotDateC nvarchar(2)
)	
RETURNS int
AS BEGIN
DECLARE @NumRecords int = 0
set @NumRecords = 
(select COUNT(IDlot) 
from [dbo].[parView_StockViewer]
(@IDcompany,					
@whdesc, 
@um ,
@IDlot ,
@IDlot_origine ,
@stepRoll ,
@eur1,
@ord_rif,
@item ,@itemC ,@itemDesc,@itemDescC, @lcdesc, @lcdescC,									    
@la ,@laC,@lu ,@luC ,@pz ,@pzC ,
@de ,@deC ,@di ,@diC ,@ncut ,@ncutC ,
@qty ,@qtyC , @lotDate , @lotDateC,
1,'asc',0,999999	 --Parametri pagining tabella, fissiamo un valore altissimo per farci restituire il numero dei record
) 
)
    RETURN @NumRecords
END;
GO
/****** Object:  UserDefinedFunction [dbo].[Split3]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[Split3] ( @strString varchar(4000))
RETURNS  @Result TABLE(Value nvarchar(20))
AS
BEGIN
 
      DECLARE @x XML 
      SELECT @x = CAST('<A>'+ REPLACE(@strString,',','</A><A>')+ '</A>' AS XML)
     
      INSERT INTO @Result            
      SELECT t.value('.', 'nvarchar(20)') AS inVal
      FROM @x.nodes('/A') AS x(t)
 
    RETURN
END;
GO
/****** Object:  Table [dbo].[transactions]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[transactions](
	[IDtransaction] [nvarchar](100) NOT NULL,
	[IDcompany] [int] NOT NULL,
	[date_tran] [datetime] NOT NULL,
	[IDlot] [nvarchar](20) NOT NULL,
	[IDwarehouse] [nvarchar](100) NOT NULL,
	[IDlocation] [nvarchar](100) NOT NULL,
	[segno] [nvarchar](1) NOT NULL,
	[qty] [float] NULL,
	[IDtrantype] [int] NOT NULL,
	[ord_rif] [nvarchar](100) NULL,
	[username] [nvarchar](35) NOT NULL,
	[IDbp] [nvarchar](100) NULL,
	[IDprodOrd] [nvarchar](100) NULL,
 CONSTRAINT [transactions_PK] PRIMARY KEY CLUSTERED 
(
	[IDtransaction] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WAC_year_layers]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WAC_year_layers](
	[IDlayer] [nvarchar](100) NOT NULL,
	[IDcompany] [int] NOT NULL,
	[username] [nvarchar](35) NOT NULL,
	[date_calc] [datetime] NOT NULL,
	[year_layer] [smallint] NOT NULL,
	[definitive] [bit] NOT NULL,
	[date_definitive] [datetime] NULL,
 CONSTRAINT [WAC_year_layers_PK] PRIMARY KEY CLUSTERED 
(
	[IDlayer] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  UserDefinedFunction [dbo].[1111parView_WAC_year_can_be_created]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[1111parView_WAC_year_can_be_created] (@IDcompany int)
RETURNS TABLE
AS
RETURN
/* 
Usata eslusivamente per la drop down che propone gli anni dove è possibile creare i layer
select * from [dbo].[parView_WAC_year_can_be_created](845)
Query che estrae i possibili layer WAC creabili o ricalcolabili, seguo le seguenti regole 
- Si parte dal presupposto che possiamo calcolare solo anni che sono presenti nelle transazioni, non avrebbe senso creare 
strati di anni non presenti nelle transazioni
- The creation of an year layer must be done when the financial year is completed (Example: you cannot create layer 2030 on 1 December 2030)
- Before to set an year layer as "definitive" is mandatory to check that all lots has been correctly valorized (purchase cost).
- In order to create a new year layer is mandatory to set to "definitive" the previous.
- When an year layer will be set to "definitive" will be unmanageble (no changes will be permitted) 
*/
/*   Attenzione alla date salvate in UTC (analizzando l'anno il problema è minimo)  */
select top 1 * 
from
	(/*Estrazione degli anni presenti nella transazioni della company*/
	 select distinct year(date_tran) as tr_year
	 from  dbo.transactions tr
	 where tr.IDcompany = @IDcompany) year_from_trans
where
/* Controllo che l'anno non sià già stato creato e messo in definitivo */
tr_year not in (select distinct year_layer from dbo.WAC_year_layers where definitive=1 and IDcompany = @IDcompany)
/* Controllo che l'anno non sia ancora in corso */
and tr_year < YEAR(getutcdate())
/* Controllo che l'anno precedente sia stato messo come "definitivo", 
se non c'è un anno precedente significa che è il primo anno di calcolo e quindi deve essere permesso */
and (
	-- O ci sono anni precedenti definitivi Oppure è il primo anno, diversamente non estraiamo anni da calcolare
	(select COUNT(*) from dbo.WAC_year_layers where IDcompany = @IDcompany and year_layer = tr_year-1 and definitive=1) = 1	--ci sono anni precedenti, devono essere definitivi
	or
	(select COUNT(*) from dbo.WAC_year_layers where IDcompany = @IDcompany and year_layer < tr_year) = 0)  --Non ci sono anni precedenti creati, è il primo anno
and tr_year > isnull((select max(year_layer) from dbo.WAC_year_layers where IDcompany = @IDcompany),0)  -- se viene "forzato" un layer senza creare quelli precedenti la funzione non deve permettere di generare il precedente
order by 1 asc
GO
/****** Object:  Table [dbo].[country]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[country](
	[IDcompany] [int] NOT NULL,
	[IDcountry] [nvarchar](100) NOT NULL,
	[desc] [nvarchar](20) NOT NULL,
 CONSTRAINT [country_PK] PRIMARY KEY CLUSTERED 
(
	[IDcountry] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[warehouse]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[warehouse](
	[IDcompany] [int] NOT NULL,
	[IDwarehouse] [nvarchar](100) NOT NULL,
	[IDcountry] [nvarchar](100) NOT NULL,
	[desc] [nvarchar](100) NOT NULL,
 CONSTRAINT [warehouse_PK] PRIMARY KEY CLUSTERED 
(
	[IDwarehouse] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[warehouse_location]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[warehouse_location](
	[IDcompany] [int] NOT NULL,
	[IDwarehouse] [nvarchar](100) NOT NULL,
	[IDlocation] [nvarchar](100) NOT NULL,
	[desc] [nvarchar](100) NOT NULL,
	[note] [nvarchar](200) NULL,
	[DefaultLoadLocPerWh] [bit] NULL,
	[IDwh_loc_Type] [int] NOT NULL,
 CONSTRAINT [warehouse_location_PK] PRIMARY KEY CLUSTERED 
(
	[IDlocation] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[warehouse_location_type]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[warehouse_location_type](
	[IDwh_loc_Type] [int] IDENTITY(1,1) NOT NULL,
	[tname] [nvarchar](30) NOT NULL,
	[tdesc] [nvarchar](100) NULL,
	[evaluated] [bit] NOT NULL,
 CONSTRAINT [warehouse_location_type_PK] PRIMARY KEY CLUSTERED 
(
	[IDwh_loc_Type] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  UserDefinedFunction [dbo].[1111_parView_warehouse_location]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[1111_parView_warehouse_location] (@IDcompany int)
RETURNS TABLE
AS
RETURN
select w.IDwarehouse, wl.IDlocation, w.IDcountry, w.[desc] as wdesc, isnull(wl.[desc],'Not found ...') as wldesc, wl.note as wlnote, c.[desc] as cdesc, wlt.tname 
from dbo.warehouse w 
left outer join dbo.warehouse_location wl on wl.IDcompany = w.IDcompany and w.IDwarehouse = wl.IDwarehouse 
inner join dbo.country c on c.IDcompany = w.IDcompany and w.IDcountry = c.IDcountry 
inner join dbo.warehouse_location_type wlt on wl.IDwh_loc_Type = wlt.IDwh_loc_Type
where w.IDcompany = @IDcompany
GO
/****** Object:  Table [dbo].[cutting_order]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[cutting_order](
	[IDcompany] [int] NOT NULL,
	[IDlot] [nvarchar](20) NOT NULL,
	[executed] [bit] NOT NULL,
	[date_executed] [datetime] NULL,
	[username] [nvarchar](35) NULL,
	[date_creation] [datetime] NULL,
	[date_planned] [datetime] NULL,
	[id] [nvarchar](100) NOT NULL,
 CONSTRAINT [cutting_order_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[cutting_order_row]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[cutting_order_row](
	[IDcompany] [int] NOT NULL,
	[IDlot] [nvarchar](20) NOT NULL,
	[IDcut] [nvarchar](100) NOT NULL,
	[PZ] [int] NOT NULL,
	[LA] [float] NOT NULL,
	[LU] [float] NOT NULL,
	[IDlot_new] [nvarchar](20) NULL,
	[ord_rif] [nvarchar](100) NULL,
	[step_roll_order] [int] NULL,
	[step_roll] [bit] NOT NULL,
	[IDlocation] [nvarchar](100) NULL,
 CONSTRAINT [cutting_order_row_PK] PRIMARY KEY CLUSTERED 
(
	[IDcut] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[item]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[item](
	[IDitem] [nvarchar](100) NOT NULL,
	[item] [nvarchar](47) NOT NULL,
	[item_desc] [nvarchar](100) NULL,
	[um] [nvarchar](5) NOT NULL,
	[item_group] [nvarchar](10) NOT NULL,
	[IDcompany] [int] NULL,
	[DefaultUnitValue] [float] NULL,
	[configuration] [nvarchar](max) NULL,
	[standard_product_id] [nvarchar](100) NULL,
	[configured_item] [tinyint] NULL,
 CONSTRAINT [item_PK] PRIMARY KEY CLUSTERED 
(
	[IDitem] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[lot]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[lot](
	[IDcompany] [int] NOT NULL,
	[IDlot] [nvarchar](20) NOT NULL,
	[IDitem] [nvarchar](100) NOT NULL,
	[date_ins] [datetime] NULL,
	[date_lot] [datetime] NULL,
	[IDlot_padre] [nvarchar](20) NULL,
	[IDlot_origine] [nvarchar](20) NULL,
	[IDlot_fornitore] [nvarchar](20) NULL,
	[note] [nvarchar](200) NULL,
	[IDbp] [nvarchar](100) NULL,
	[stepRoll] [bit] NOT NULL,
	[step_roll_order] [int] NOT NULL,
	[checked_value] [bit] NOT NULL,
	[devaluation] [int] NULL,
	[ord_rif] [nvarchar](100) NULL,
	[checked_value_date] [datetime] NULL,
	[eur1] [bit] NOT NULL,
	[conf_item] [bit] NOT NULL,
	[merged_lot] [bit] NOT NULL,
 CONSTRAINT [lot_PK] PRIMARY KEY CLUSTERED 
(
	[IDlot] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[material_issue_temp]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[material_issue_temp](
	[IDcompany] [int] NOT NULL,
	[IDissue] [nvarchar](100) NOT NULL,
	[username] [nvarchar](35) NOT NULL,
	[qty] [float] NOT NULL,
	[IDStock] [nvarchar](100) NULL,
	[date_ins] [datetime] NULL,
 CONSTRAINT [material_issue_temp_PK] PRIMARY KEY CLUSTERED 
(
	[IDissue] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[material_transfer_temp]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[material_transfer_temp](
	[IDcompany] [int] NOT NULL,
	[IDtrans] [nvarchar](100) NOT NULL,
	[username] [nvarchar](35) NOT NULL,
	[qty] [float] NOT NULL,
	[IDStock] [nvarchar](100) NULL,
	[date_ins] [datetime] NULL,
 CONSTRAINT [material_transfer_temp_PK] PRIMARY KEY CLUSTERED 
(
	[IDtrans] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[order_production]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[order_production](
	[IDord] [nvarchar](100) NOT NULL,
	[IDcompany] [int] NOT NULL,
	[IDlot] [nvarchar](20) NOT NULL,
	[IDwarehouse] [nvarchar](100) NOT NULL,
	[IDlocation] [nvarchar](100) NULL,
	[qty] [float] NOT NULL,
	[username] [nvarchar](35) NOT NULL,
	[date_creation] [datetime] NULL,
	[date_executed] [datetime] NULL,
	[executed] [bit] NULL,
 CONSTRAINT [order_production_PK] PRIMARY KEY CLUSTERED 
(
	[IDord] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[order_production_components]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[order_production_components](
	[IDcomp] [nvarchar](100) NOT NULL,
	[IDord] [nvarchar](100) NOT NULL,
	[IDcompany] [int] NOT NULL,
	[IDitem] [nvarchar](100) NOT NULL,
	[qty_expected] [float] NULL,
	[auto_lot] [bit] NOT NULL,
	[IDStock] [nvarchar](100) NULL,
	[qty] [float] NULL,
	[executed] [bit] NOT NULL,
	[username] [nvarchar](35) NULL,
	[IDlot] [nvarchar](20) NOT NULL,
 CONSTRAINT [order_production_components_PK] PRIMARY KEY CLUSTERED 
(
	[IDcomp] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[stock]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[stock](
	[IDstock] [nvarchar](100) NOT NULL,
	[IDcompany] [int] NOT NULL,
	[IDlot] [nvarchar](20) NOT NULL,
	[IDwarehouse] [nvarchar](100) NOT NULL,
	[IDlocation] [nvarchar](100) NOT NULL,
	[qty_stock] [float] NOT NULL,
	[IDinventory] [nvarchar](100) NULL,
	[invUsername] [nvarchar](35) NULL,
	[invDate_ins] [datetime] NULL,
 CONSTRAINT [stock_PK] PRIMARY KEY CLUSTERED 
(
	[IDstock] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  UserDefinedFunction [dbo].[1111parView_activityViewer]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[1111parView_activityViewer] (@IDcompany int)
RETURNS TABLE

AS

RETURN

-- Ordini di produzione (consumo di componenti)
select 'Production order' as activity, w.[desc] as wdesc,substring(convert(varchar, ord.date_creation, 20),1,16) as dt, i.item, i.item_desc, ord.IDlot, dbo.getDimByLotShortDesc(ord.IDcompany, ord.IDlot) as dim, l.ord_rif, l.note, ord.username,
ic.item + ' ' + ic.item_desc + ': '  + cast(ordC.qty as nvarchar(max)) + ' ' + ic.um as msg
from dbo.order_production ord 
inner join dbo.lot l on l.IDcompany = ord.IDcompany and ord.IDlot = l.IDlot
inner join dbo.item i on i.IDitem = l.IDitem
inner join dbo.order_production_components ordC on ord.IDord = ordC.IDord and ord.IDcompany = ordC.IDcompany 
inner join dbo.item ic on ic.IDitem = ordC.IDitem
inner join dbo.warehouse w on w.IDcompany = ord.IDcompany and w.IDwarehouse = ord.IDwarehouse
where ord.IDcompany = @IDcompany and ord.executed = 0 

union -- Commesse di taglio 
select 'Cutting order' as activity, w.[desc] as wdesc, substring(convert(varchar, o.date_creation, 20),1,16) as dt, i.item, i.item_desc, o.IDlot, dbo.getDimByLotShortDesc(o.IDcompany, o.IDlot) as dim, l.ord_rif, l.note, o.username, 
cast(r.LA as nvarchar(max)) + ' x ' + cast(r.LU as nvarchar(max))  + ' x ' + cast(r.PZ as nvarchar(max)) + ': ' + r.ord_rif as msg
from dbo.cutting_order o
inner join dbo.lot l on l.IDcompany = o.IDcompany and l.IDlot = o.IDlot
inner join dbo.item i on i.IDitem = l.IDitem
inner join dbo.cutting_order_row r on r.IDcompany = o.IDcompany and o.IDlot = r.IDlot
inner join dbo.stock s on s.IDcompany = o.IDcompany and o.IDlot = s.IDlot  /*Questi lotti non sono frazionabili, quindi 1 solo lotto in magazzino sempre */
inner join dbo.warehouse w on w.IDcompany = o.IDcompany and w.IDwarehouse = s.IDwarehouse
where o.IDcompany = @IDcompany and o.date_executed is null
/* Verifica che esista a giacenza, che non abbiamo creato e poi eliminato, abbiamo cmq aggiunto nella pulizia 
notturna il task per la pulizia di questa casistica */
and o.IDlot in (select IDlot from stock s where s.IDcompany = o.IDcompany and s.IDlot = o.IDlot) 

union -- Materiali in trasferimento 
select 'Transfer' as activity, w.[desc] as wdesc, substring(convert(varchar, t.date_ins, 20),1,16) as dt, isnull(i.item,''), isnull(i.item_desc,''), isnull(s.IDlot,'Lot not found...'), dbo.getDimByLotShortDesc(s.IDcompany, s.IDlot) as dim, isnull(l.ord_rif,''), isnull(l.note,''), t.username 
, isnull(w.[desc],'') + ' - ' + isnull(wl.[desc],'') as msg
from dbo.material_transfer_temp t
left outer join dbo.stock s on s.IDcompany = t.IDcompany and t.IDStock = s.IDstock  /* Possibilità che movimentano le giacenza, quindi left .. */
left outer join dbo.warehouse w on t.IDcompany = w.IDcompany and w.IDwarehouse = s.IDwarehouse
left outer join dbo.warehouse_location wl on t.IDcompany = wl.IDcompany and wl.IDlocation = s.IDlocation
left outer join dbo.lot l on t.IDcompany = l.IDcompany and s.IDlot = l.IDlot
left outer join dbo.item i on i.IDitem = l.IDitem
where t.IDcompany = @IDcompany

union -- Materiali in spedizione 
select 'Shipment' as activity, w.[desc] as wdesc, substring(convert(varchar, t.date_ins, 20),1,16) as dt, isnull(i.item,''), isnull(i.item_desc,''), isnull(s.IDlot,'Lot not found...'), dbo.getDimByLotShortDesc(s.IDcompany, s.IDlot) as dim, isnull(l.ord_rif,''), isnull(l.note,''), t.username 
, isnull(w.[desc],'') + ' - ' + isnull(wl.[desc],'') as msg
from dbo.material_issue_temp t
left outer join dbo.stock s on s.IDcompany = t.IDcompany and t.IDStock = s.IDstock  /* Possibilità che movimentano le giacenza, quindi left .. */
left outer join dbo.warehouse w on t.IDcompany = w.IDcompany and w.IDwarehouse = s.IDwarehouse
left outer join dbo.warehouse_location wl on t.IDcompany = wl.IDcompany and wl.IDlocation = s.IDlocation
left outer join dbo.lot l on t.IDcompany = l.IDcompany and s.IDlot = l.IDlot
left outer join dbo.item i on i.IDitem = l.IDitem
where t.IDcompany = @IDcompany
GO
/****** Object:  UserDefinedFunction [dbo].[1111parView_cutting_active]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/****** Script for SelectTopNRows command from SSMS  ******/



CREATE FUNCTION [dbo].[1111parView_cutting_active] (@IDcompany int)
RETURNS TABLE

AS

RETURN

select s.IDlot, i.item, i.item_desc, s.qty_stock, i.um, 
l.ord_rif, l.note,
c.date_creation, c.date_planned,
(select isnull(sum((LA*LU*PZ)/1000000),0) from cutting_order_row cr where cr.IDcompany = s.IDcompany and  cr.IDlot = s.IDlot) as qty_planned,
(select count(cr1.IDlot) from cutting_order_row cr1 where cr1.IDcompany = s.IDcompany and  cr1.IDlot = s.IDlot) as cuts
from stock s 
inner join cutting_order c on s.IDlot = c.IDlot and s.IDcompany = c.IDcompany
inner join lot l on l.IDcompany = s.IDcompany and s.IDlot = l.IDlot	
inner join item i on i.IDitem = l.IDitem 
where s.IDcompany = @IDcompany
GO
/****** Object:  Table [dbo].[item_stock_limits]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[item_stock_limits](
	[IDitemStockLimits] [nvarchar](100) NOT NULL,
	[IDcompany] [int] NOT NULL,
	[IDitem] [nvarchar](100) NOT NULL,
	[IDwarehouse] [nvarchar](100) NOT NULL,
	[qty_min] [float] NOT NULL,
	[qty_max] [float] NOT NULL,
	[username] [nvarchar](35) NOT NULL,
	[date_ins] [datetime] NULL,
	[enabled] [bit] NOT NULL,
 CONSTRAINT [item_stock_limits_PK] PRIMARY KEY CLUSTERED 
(
	[IDitemStockLimits] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[1111vw_item_stock_limits_last_values]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[1111vw_item_stock_limits_last_values] AS 
select i.IDitemStockLimits, i.IDcompany, i.IDitem, i.IDwarehouse, i.qty_min, i.qty_max, i.username, 
substring(convert(varchar, i.date_ins, 20),1,20) as date_ins 
,ii.item, ii.item_desc, ii.um,  w.[desc] as wdesc
from item_stock_limits i
inner join item ii on ii.IDitem = i.IDitem
inner join warehouse w on w.IDcompany = i.IDcompany and w.IDwarehouse = i.IDwarehouse
where i.IDitemStockLimits in 
( /* Ultimo record caricato base company-articolo-magazzino */
select MAX(ismm.IDitemStockLimits) lastRecord
from item_stock_limits ismm
group by ismm.IDcompany, ismm.IDitem, ismm.IDwarehouse)
GO
/****** Object:  Table [dbo].[lot_dimension]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[lot_dimension](
	[IDcompany] [int] NOT NULL,
	[IDlot] [nvarchar](20) NOT NULL,
	[IDcar] [nvarchar](3) NOT NULL,
	[val] [float] NULL,
	[id] [nvarchar](100) NOT NULL,
 CONSTRAINT [lot_dimension_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_info_by_lot]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_info_by_lot] AS select l.IDitem,l.IDlot, l.IDcompany, item, item_desc, 
isnull(d1.val, 0) as la, isnull(d2.val, 0) as lu, isnull(d3.val, 0) as pz, isnull(d4.val, 0) as di, isnull(d5.val, 0) as de,
um,  (isnull(d1.val, 0)*isnull(d2.val, 0)*isnull(d3.val, 0)/1000000) as m2 ,
wh.IDwarehouse as IDwh,
wh.[desc] as whdesc,
whlc.[desc] as whlcdesc,
whlc.IDlocation as IDwhl,
l.stepRoll,
l.ord_rif,
isnull(st.qty_stock,0) as  qty_stock   /*2020-02-24, per order_production page 20
										2020-04-08, usato ance su commesse di taglio, nel caso in cui non c'è giacenza non attiviamo la procedura */,l.note
from lot l
inner join item i on i.IDitem = l.IDitem
left outer join lot_dimension d1 on d1.IDlot = l.IDlot and d1.IDcompany = l.IDcompany and d1.IDcar = 'LA'
left outer join lot_dimension d2 on d2.IDlot = l.IDlot and d2.IDcompany = l.IDcompany and d2.IDcar = 'LU'
left outer join lot_dimension d3 on d3.IDlot = l.IDlot and d3.IDcompany = l.IDcompany and d3.IDcar = 'PZ'
left outer join lot_dimension d4 on d4.IDlot = l.IDlot and d4.IDcompany = l.IDcompany and d4.IDcar = 'DI'
left outer join lot_dimension d5 on d5.IDlot = l.IDlot and d5.IDcompany = l.IDcompany and d5.IDcar = 'DE'
left outer join stock st on st.IDlot = l.IDlot and st.IDcompany = l.IDcompany
left outer join warehouse wh on wh.IDwarehouse = st.IDwarehouse and wh.IDcompany = l.IDcompany
left outer join warehouse_location whlc on whlc.IDlocation = st.IDlocation and whlc.IDcompany = l.IDcompany
GO
/****** Object:  Table [dbo].[lot_value]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[lot_value](
	[IDcompany] [int] NOT NULL,
	[IDlot] [nvarchar](20) NOT NULL,
	[date_ins] [datetime] NOT NULL,
	[UnitValue] [float] NOT NULL,
	[username] [nvarchar](35) NOT NULL,
	[IDdevaluation] [nvarchar](100) NULL,
	[note] [nvarchar](150) NULL,
	[id] [nvarchar](100) NOT NULL,
 CONSTRAINT [lot_value_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_lot_first_value]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_lot_first_value] AS /*
2021-01-27, Recupero il primo valore diverso da zero assegnato ad un lotto,
visto aggiunta per lo sviluppo del "costo medio ponderato"
*/
select lv.IDcompany, lv.IDlot, lv.date_ins, lv.UnitValue, lv.note
from dbo.lot_value lv
inner join 
  (/* Primo valore caricato diverso da zero */
  select h.IDcompany, h.IDlot, min(h.date_ins) dt
  from dbo.lot_value h
  inner join dbo.lot l on h.IDcompany = l.IDcompany and l.IDlot = h.IDlot and DATEADD (ss, 10, h.date_ins) >= l.checked_value_date   --2022 10 28, Ab, solo record => dopo l'approvazione (aggiungiamo 10 secondi per possibili ritardi nell'update)
  where UnitValue <> 0
  group by h.IDcompany, h.IDlot) lastVal on lastVal.IDcompany = lv.IDcompany and lastVal.IDlot = lv.IDlot and lv.date_ins = lastVal.dt
--where lv.IDlot = 'FRVIF20001991';
GO
/****** Object:  Table [dbo].[company]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[company](
	[IDcompany] [int] NOT NULL,
	[desc] [nvarchar](35) NOT NULL,
	[curr] [nvarchar](3) NOT NULL,
	[lot_code] [nvarchar](2) NOT NULL,
	[LN_bpid_code] [nchar](9) NULL,
	[CSM_bpid_code] [nvarchar](100) NULL,
	[logo_on_prints] [nvarchar](50) NULL,
	[read_alternative_item_code] [bit] NOT NULL,
 CONSTRAINT [company_PK] PRIMARY KEY NONCLUSTERED 
(
	[IDcompany] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Index [company]    Script Date: 20/09/2023 11:04:12 ******/
CREATE UNIQUE CLUSTERED INDEX [company] ON [dbo].[company]
(
	[IDcompany] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[lot_type]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[lot_type](
	[IDcompany] [int] NOT NULL,
	[IDlotType] [nvarchar](2) NOT NULL,
	[desc] [nvarchar](20) NOT NULL,
	[id] [nvarchar](100) NOT NULL,
 CONSTRAINT [lot_type_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[zzz_vw_GeneraCodiciLottoPerCompany]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[zzz_vw_GeneraCodiciLottoPerCompany] AS /* Vista utilizzata per creare i codici lotti, in sostanza questa vista ci restituirsce già
i nuovi codici lotto considerando che :
- Ogni company ha la sua desinenza, ES: 845 ha FR che sono i primi 2 caratteri della stringa 
- I successivi 2 caratteri rappresentano il magazzino di primo versamento del lotto, tabella di riferimento country (IDcountry) nella tabella dei magazzini 
- il terzo carattere è il tipo di lotto (tabella lot_type) 
- 2 numeri per l'anno corrente 
- In fine ci sono 6 posizioni numeriche che si azzerano ogni anno */
select comp.IDcompany, lot_code, IDcountry, IDlotType, substring(cast(year(getdate()) as char),3,2) as year_number, 
FORMAT(
isnull(
	  (select max(cast(SUBSTRING(IDlot, 8, 6) as int)) + 1
	   from lot 
	   where lot.IDcompany = comp.IDcompany
	   /* Filtro sugli ultimi 2 numeri dell'anno, selezioniamo tutti i lotti dell'anno corrente */
	   and SUBSTRING(IDlot, 6, 2) = substring(cast(year(getdate()) as char),3,2) 
	   /* Filtro sul tipo di lotto (acquistato, tagliato ... ) */
	   and SUBSTRING(IDlot, 5, 1) = IDlotType
	   /* Filtro sul paese del lotto*/
	   and SUBSTRING(IDlot, 3, 2) = IDcountry)    
,1) 
, '000000') as seriale 
from dbo.company comp 
inner join dbo.lot_type lty on lty.IDcompany = comp.IDcompany
inner join dbo.country co on co.IDcompany = comp.IDcompany
GO
/****** Object:  View [dbo].[vw_info_by_lot_etichette]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE view [dbo].[vw_info_by_lot_etichette] as 
/*
Vista a doc per la stampa delle etichette
*/
select l.IDcompany, l.IDlot, item, item_desc, dbo.getDimByLotShortDesc(l.IDcompany, l.IDlot) as dim,
um, wh.[desc] as whdesc, whlc.[desc] as whlcdesc, stepRoll, l.note, IDstock, qty_stock
from lot l
inner join item i on i.IDitem = l.IDitem
left outer join stock st on st.IDlot = l.IDlot and st.IDcompany = l.IDcompany
left outer join warehouse wh on wh.IDwarehouse = st.IDwarehouse and wh.IDcompany = l.IDcompany
left outer join warehouse_location whlc on whlc.IDlocation = st.IDlocation and whlc.IDcompany = l.IDcompany
GO
/****** Object:  View [dbo].[zzzz_vw_delboca_stock_viewer_fr]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[zzzz_vw_delboca_stock_viewer_fr] AS /* 2020 03 31, AB, estrazione dello stock completo come
da richiesta (colonne come sessione baan whchi9s91m000)*/
select
stock.IDwarehouse as "COD. MAG", wh.[desc] as "MAG.", 
item.item as ITEM, wh_lc.[desc] as UBICAZIONE, item.item_group AS "TIPO PROD.", 
item.item_desc AS "DESC. ART.", item.um as "UM",
lot.IDlot as LOTTO, IDlot_origine AS "LOTTO ORI.", 
substring(convert(varchar, lot.date_lot, 20),1,10) as "DATA LT.", 
substring(convert(varchar, 
				 (select top 1 date_lot from lot where IDlot = IDlot_origine)
				 , 20),1,10) as "DATA LT. ORI.",
isnull(la.val,'') as LARG, isnull(lu.val,'') as LUNG, isnull(de.val,'') as "D. EST", isnull(di.val,'') as "D. INT.", 
isnull(de.val,'') - isnull(di.val,'') AS "SPESS.",
isnull(pz.val,'') as PZ,    
qty_stock as GIACENZA, 
lot.note + lot.ord_rif as NOTA,
substring(convert(varchar, 
						 (select max(date_tran) from transactions where IDlot = 'FRLYF20000018') 
						, 20),1,10) as "DATA ULT.TR."
from dbo.stock inner join lot on lot.IDcompany = stock.IDcompany and lot.IDlot = stock.IDlot 
inner join item on item.IDitem = lot.IDitem 
inner join warehouse wh on wh.IDcompany = stock.IDcompany and stock.IDwarehouse = wh.IDwarehouse 
inner join warehouse_location wh_lc on wh_lc.IDcompany = stock.IDcompany and stock.IDlocation = wh_lc.IDlocation
/* Non tutti gli articoli hanno tutte le dimensioni */
left outer join dbo.lot_dimension la on la.IDcompany = stock.IDcompany and la.IDlot = stock.IDlot and la.IDcar = 'LA' 
left outer join dbo.lot_dimension lu on lu.IDcompany = stock.IDcompany and lu.IDlot = stock.IDlot and lu.IDcar = 'LU' 
left outer join dbo.lot_dimension pz on pz.IDcompany = stock.IDcompany and pz.IDlot = stock.IDlot and pz.IDcar = 'PZ' 
left outer join dbo.lot_dimension de on de.IDcompany = stock.IDcompany and de.IDlot = stock.IDlot and de.IDcar = 'DE' 
left outer join dbo.lot_dimension di on di.IDcompany = stock.IDcompany and di.IDlot = stock.IDlot and di.IDcar = 'DI' 
where stock.IDcompany = 845
GO
/****** Object:  View [dbo].[vw_ERRORchecker_stockVStransactions]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE view [dbo].[vw_ERRORchecker_stockVStransactions] as  
/* 2020-04-08, AB
Questa vista raffronta le quantità a magazzino con quelle che vengono generate dalla risultante delle transaioni 
per vedere eventuali discordanza tra le 2.

ATTENZIONE 1: dentro la vista cìè la company specificata, è da modificare a mamo
ATTENZIONE 2: se aggiungiamo order by 7 mettiamo in evidenza tutti i possibili problemi

*/
select IDcompany, IDlot, IDwarehouse, IDlocation, qty_stock as qty_stockByTransactions 	
		/* Recupero del valore attuale nella tabella dello stock per raffrontarlo con quello che arriva dal calcolo delle transazioni */
       ,(select qty_stock from stock s where s.IDcompany = StTrs.IDcompany and s.IDlot = StTrs.IDlot and s.IDwarehouse = StTrs.IDwarehouse and s.IDlocation = StTrs.IDlocation)
	   as currentStockQty
	   , qty_stock - (select qty_stock from stock s where s.IDcompany = StTrs.IDcompany and s.IDlot = StTrs.IDlot and s.IDwarehouse = StTrs.IDwarehouse and s.IDlocation = StTrs.IDlocation) 
	   as diffAndErrors
from 
	(SELECT IDcompany, [IDlot], [IDwarehouse], IDlocation, SUM( case when [segno] = '-' then -1 * [qty] else [qty] end ) as qty_stock
	 FROM  [dbo].[transactions] where IDcompany = 846
	 group by IDcompany, [IDlot], [IDwarehouse], IDlocation
	 having SUM( case when [segno] = '-' then -1 * [qty] else [qty] end ) <> 0 
	)  StTrs --stockCalculatedFromTransactions;
GO
/****** Object:  View [dbo].[zzz_vw_lots_firstTransaction]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[zzz_vw_lots_firstTransaction] AS /* 2020 04 17, questa vista mostra il primo movimento di ogni lotto, viene
usata nella pagina per l'inserimento del valore del lotto. In quella pagina mettiamo
a video solo il primo magazzino di caricamenteo in quanto "vogliamo" mettere a video i lotti
reggruppati lotto, e ci sarebbero problemi con i lotti frazionbili. Inoltre l'infromazione del magazzino
è importante per chi carica (il magazzino di caricamento soprattutto)*/
select tt.IDcompany, IDlot, ww.[desc] as wdesc
from transactions tt
inner join warehouse ww on ww.IDcompany = tt.IDcompany and tt.IDwarehouse = ww.IDwarehouse
where IDtransaction in 
(
/* Estraggo gli ID transazioni di tutti i "primi" caricamenti di lotti (attenzione, raggrupp per IDcompany\IDlotto), in questo modo sono sicuro di prendere una singola 
transazione, la prima, per lotto */
select min(IDtransaction) as IDtransaction
from transactions t 
group by t.IDcompany, IDlot
)
GO
/****** Object:  View [dbo].[ZZZ_vw_IMPORT_USA_excelStock_1_20190910]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create view [dbo].[ZZZ_vw_IMPORT_USA_excelStock_1_20190910] as 
/* - Creiamo una tabella creando anche i lotti per gli "step roll" che nell'excel originale sono in colonna 
   - tutti i lotti avranno come orgini se stesso, e come codice lotto uguale se non è uno step roll, se invece è seguito da un 
   "-" più un numero significa che è uno step roll, il primo step roll mette lo zero controllando tutte le colonne */
select ltrim(rtrim([Product Code])) as [Product Code],
	   ltrim(rtrim(lotOri)) as lotOri, 
	   [Lot #],
	   [Invoice #],
	   [WH],
	   [Location],
	   [Package or Cut roll #],
	   cast((cast(replace(replace([a Dim 2  in  ],'.',''),',','.') as float) * 25.4) as int) as LA,    /* Conversione da inch a mmm */
	   cast((cast(replace(replace([a Dim 1  Ft  ],'.',''),',','.') as float) * 304.8) as int) as LU,   /* Conversione da feet a mmm */
	   cast([Pcs ] as float) as PZ,
	   cast(replace(replace([a Value  $  ],'.',''),',','.') as float) as Val,
	   --isnull([Note],'') as note,
	   case when (CHARINDEX('_',[Lot #]) > 0) then  /* Memo, il segno "-" meno ... nel codice lotto da problemi all'applicazione*/
			1
			else
			0		
		end as step,
		case when (CHARINDEX('_',[Lot #]) > 0) then
			RIGHT([Lot #],1)
			else
			0		
		end as stepOrd,
		case when substring([Product Code],0,3) in ('NA','CG','TC') then 'm2'
			 when substring([Product Code],0,3) in ('ES') then 'm'
			 else '' end as UM,
		case when substring([Product Code],0,3) in ('NA','CG','TC') then 
				cast(
				((cast(replace(replace([a Dim 2  in  ],'.',''),',','.') as float) * 25.4) * 
				 (cast(replace(replace([a Dim 1  Ft  ],'.',''),',','.') as float) * 304.8) * cast([Pcs ] as float) / 1000000) AS NUMERIC(18,2))
			 when substring([Product Code],0,3) in ('ES') then 
			 cast(
				(cast(replace(replace([a Dim 1  Ft  ],'.',''),',','.') as float) * 304.8) AS NUMERIC(18,2))
			 else '' end as qty,	
		case when isnull([Invoice #],'') = '' then cast(year(getdate()) as nvarchar(4))+'-01-01' /* Metto 1/1 dell'anno corrente */
		     else 
				case when SUBSTRING([Invoice #],0,3) <> '00' then			 /* Verifico che non abbiamo messo 00 al posto del numero dell'anno */
					case when isnumeric(SUBSTRING([Invoice #],0,3)) = 1 then /* verifico che sia un numero */
					 '20'+SUBSTRING([Invoice #],0,3)+'-01-01'
					 else cast(year(getdate()) as nvarchar(4))+'-01-01'
					 end
				else cast(year(getdate()) as nvarchar(4))+'-01-01'
				end   
			end as lotdate,
		(select isnull(IDwarehouse,'8') from dbo.warehouse w where w.IDcompany = '846' and w.[desc] = [WH]) as idwhcsm,
		isnull(
		(select IDlocation   
		from [dbo].[warehouse_location] l where l.IDcompany = 846 and 
		l.IDwarehouse = (select isnull(IDwarehouse,'8') from dbo.warehouse w where w.IDcompany = '846' and w.[desc] = [WH])
		and l.[desc] = [Location]),
		/* Se è nullo leggo la prima ubicazione del magazzino */
		(select top 1 IDlocation 
		 from [dbo].[warehouse_location] ll 
		 where ll.IDcompany = 846 and ll.IDwarehouse = (select isnull(ww.IDwarehouse,'8') from dbo.warehouse ww where ww.IDcompany = '846' and ww.[desc] = [WH]))
		 )as idloccsm
from 
(
/* Selezione di tutti i "padri "*/
SELECT [Product Code],[Lot #] as lotOri, 
case when ( /* Se vedo che è uno step roll metto il "-0" davanti al lotto per riconoscerlo */
	ltrim(rtrim([b Dim 1  Ft  ])) <> '' or ltrim(rtrim([b Dim 2  in  ])) <>  '' or ltrim(rtrim([b Value  $  ])) <> '' or
	ltrim(rtrim([c Dim 1  Ft  ])) <> '' or ltrim(rtrim([c Dim 2  in  ])) <>  '' or ltrim(rtrim([c Value  $  ])) <> '' or
	ltrim(rtrim([d Dim 1  Ft  ])) <> '' or ltrim(rtrim([d Dim 2  in  ])) <>  '' or ltrim(rtrim([d Value  $  ])) <> '' or
	ltrim(rtrim([e Dim 1  Ft  ])) <> '' or ltrim(rtrim([e Dim 2  in  ])) <>  '' or ltrim(rtrim([e Value  $  ])) <> '' /*or
	ltrim(rtrim([f Dim 1  Ft  ])) <> '' or ltrim(rtrim([f Dim 2  in  ])) <>  '' or ltrim(rtrim([f Value  $  ])) <> '' or
	ltrim(rtrim([g Dim 1  Ft  ])) <> '' or ltrim(rtrim([g Dim 2  in  ])) <>  '' or ltrim(rtrim([g Value  $  ])) <> '' or
	ltrim(rtrim([h Dim 1  Ft  ])) <> '' or ltrim(rtrim([h Dim 2  in  ])) <>  '' or ltrim(rtrim([h Value  $  ])) <> '' or
	ltrim(rtrim([i Dim 1  Ft  ])) <> '' or ltrim(rtrim([i Dim 2  in  ])) <>  '' or ltrim(rtrim([i Value  $  ])) <> ''*/)
	then [Lot #]+'_0'else [Lot #] end as [Lot #],
[Invoice #],[WH],[Location],[Package or Cut roll #],[Pcs ],[a Dim 1  Ft  ],[a Dim 2  in  ], [a Value  $  ] --,[Note]
FROM [dbo].ZZZ_importExcelUSA20190722
union
/* Selezione step roll 1 */
SELECT [Product Code],[Lot #] as lotOri, [Lot #]+'_1',[Invoice #],[WH],[Location],[Package or Cut roll #],[Pcs ],[b Dim 1  Ft  ],[b Dim 2  in  ],[b Value  $  ] --,[Note]
FROM [dbo].ZZZ_importExcelUSA20190722
where ltrim(rtrim([b Dim 1  Ft  ])) <> '' and ltrim(rtrim([b Dim 2  in  ])) <>  '' and ltrim(rtrim([b Value  $  ])) <> ''
union
/* Selezione step roll 2 */
SELECT [Product Code],[Lot #] as lotOri, [Lot #]+'_2',[Invoice #],[WH],[Location],[Package or Cut roll #],[Pcs ],[c Dim 1  Ft  ],[c Dim 2  in  ],[c Value  $  ]--,[Note]
FROM [dbo].ZZZ_importExcelUSA20190722
where ltrim(rtrim([c Dim 1  Ft  ])) <> '' and ltrim(rtrim([c Dim 2  in  ])) <>  '' and ltrim(rtrim([c Value  $  ])) <> ''  
union
/* Selezione step roll 3 */
SELECT [Product Code],[Lot #] as lotOri, [Lot #]+'_3',[Invoice #],[WH],[Location],[Package or Cut roll #],[Pcs ],[d Dim 1  Ft  ],[d Dim 2  in  ],[d Value  $  ]--,[Note]
FROM [dbo].ZZZ_importExcelUSA20190722
where ltrim(rtrim([d Dim 1  Ft  ])) <> '' and ltrim(rtrim([d Dim 2  in  ])) <>  '' and ltrim(rtrim([d Value  $  ])) <> ''
union
/* Selezione step roll 4 */
SELECT [Product Code],[Lot #] as lotOri, [Lot #]+'_4',[Invoice #],[WH],[Location],[Package or Cut roll #],[Pcs ],[e Dim 1  Ft  ],[e Dim 2  in  ],[e Value  $  ]--,[Note]
FROM [dbo].ZZZ_importExcelUSA20190722
where ltrim(rtrim([e Dim 1  Ft  ])) <> '' and ltrim(rtrim([e Dim 2  in  ])) <>  '' and ltrim(rtrim([e Value  $  ])) <> ''
/*union
/* Selezione step roll 5 */
SELECT [Product Code],[Lot #] as lotOri, [Lot #]+'_5',[Invoice #],[WH],[Location],[Package or Cut roll #],[Pcs ],[f Dim 1  Ft  ],[f Dim 2  in  ],[f Value  $  ]--,[Note]
FROM [csm].[dbo].ZZZ_importExcelUSA20190722
where ltrim(rtrim([f Dim 1  Ft  ])) <> '' and ltrim(rtrim([f Dim 2  in  ])) <>  '' and ltrim(rtrim([f Value  $  ])) <> ''
union
/* Selezione step roll 6 */
SELECT [Product Code],[Lot #] as lotOri, [Lot #]+'_6',[Invoice #],[WH],[Location],[Package or Cut roll #],[Pcs ],[g Dim 1  Ft  ],[g Dim 2  in  ],[g Value  $  ]--,[Note]
FROM [csm].[dbo].ZZZ_importExcelUSA20190722
where ltrim(rtrim([g Dim 1  Ft  ])) <> '' and ltrim(rtrim([g Dim 2  in  ])) <>  '' and ltrim(rtrim([g Value  $  ])) <> ''
union
/* Selezione step roll 7 */
SELECT [Product Code],[Lot #] as lotOri, [Lot #]+'_7',[Invoice #],[WH],[Location],[Package or Cut roll #],[Pcs ],[h Dim 1  Ft  ],[h Dim 2  in  ],[h Value  $  ]--,[Note]
FROM [csm].[dbo].ZZZ_importExcelUSA20190722
where ltrim(rtrim([h Dim 1  Ft  ])) <> '' and ltrim(rtrim([h Dim 2  in  ])) <>  '' and ltrim(rtrim([h Value  $  ])) <> ''
union
/* Selezione step roll 8 */
SELECT [Product Code],[Lot #] as lotOri, [Lot #]+'_8',[Invoice #],[WH],[Location],[Package or Cut roll #],[Pcs ],[i Dim 1  Ft  ],[i Dim 2  in  ],[i Value  $  ]--,[Note]
FROM [csm].[dbo].ZZZ_importExcelUSA20190722
where ltrim(rtrim([i Dim 1  Ft  ])) <> '' and ltrim(rtrim([i Dim 2  in  ])) <>  '' and ltrim(rtrim([i Value  $  ])) <> ''
*/) exportTab
 where [Product Code] is not null
GO
/****** Object:  View [dbo].[ZZZ_vw_IMPORT_USA_excelStock_1_20200206]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create view [dbo].[ZZZ_vw_IMPORT_USA_excelStock_1_20200206] as 
/* - Creiamo una tabella creando anche i lotti per gli "step roll" che nell'excel originale sono in colonna 
   - tutti i lotti avranno come orgini se stesso, e come codice lotto uguale se non è uno step roll, se invece è seguito da un 
   "-" più un numero significa che è uno step roll, il primo step roll mette lo zero controllando tutte le colonne */
select ltrim(rtrim([Product Code])) as [Product Code],
	   ltrim(rtrim(lotOri)) as lotOri, 
	   [Lot #],
	   [Invoice #],
	   [WH],
	   [Location],
	   [Package or Cut roll #],  
	   cast((cast(replace(replace([a Dim 2  in  ],'.',''),',','.') as float) * 25.4) as int) as LA,    /* Conversione da inch a mmm */
	   case when substring([Product Code],0,3) in ('NA','CG','TC') then
				cast((cast(replace(replace([a Dim 1  Ft  ],'.',''),',','.') as float) * 304.8) as int) 
			when substring([Product Code],0,3) in ('ES','GM') then	
				cast((cast(replace(replace([a Dim 1  Ft  ],'.',''),',','.') as float)  * cast([Pcs ] as float)  * 304.8) as int) 
			end	as LU,   /* Conversione da feet a mmm */   
	   cast([Pcs ] as float) as PZ,
	   case when ISNUMERIC(replace(replace([a Value  $  ],'.',''),',','.')) = 1 then
			cast(replace(replace([a Value  $  ],'.',''),',','.') as float) 
	   else
			0
	   end as val,
	   --isnull([Note],'') as note,
	   case when (CHARINDEX('_',[Lot #]) > 0) then  /* Memo, il segno "-" meno ... nel codice lotto da problemi all'applicazione*/
			1
			else
			0		
		end as step,
		case when (CHARINDEX('_',[Lot #]) > 0) then
			RIGHT([Lot #],1)
			else
			0		
		end as stepOrd,
		case when substring([Product Code],0,3) in ('NA','CG','TC') then 'm2'
			 when substring([Product Code],0,3) in ('ES','GM') then 'm'
			 else '' end as UM,
		case when substring([Product Code],0,3) in ('NA','CG','TC') then 
				--cast(
				(				
				 cast((cast(replace(replace([a Dim 2  in  ],'.',''),',','.') as float) * 25.4)as int) * 
				  cast((cast(replace(replace([a Dim 1  Ft  ],'.',''),',','.') as float) * 304.8) as int) * cast([Pcs ] as float) / 1000000) 
				 --AS NUMERIC(18,2))
			 when substring([Product Code],0,3) in ('ES','GM') then 
			 cast(
				(cast(replace(replace([a Dim 1  Ft  ],'.',''),',','.') as float) * cast([Pcs ] as float) * 304.8 / 1000 ) 
				AS NUMERIC(18,2))
			 else '' end as qty,	
		case when isnull([Invoice #],'') = '' then cast(year(getdate()) as nvarchar(4))+'-01-01' /* Metto 1/1 dell'anno corrente */
		     else 
				case when SUBSTRING([Invoice #],0,3) <> '00' then			 /* Verifico che non abbiamo messo 00 al posto del numero dell'anno */
					case when isnumeric(SUBSTRING([Invoice #],0,3)) = 1 then /* verifico che sia un numero */
					 '20'+SUBSTRING([Invoice #],0,3)+'-01-01'
					 else cast(year(getdate()) as nvarchar(4))+'-01-01'
					 end
				else cast(year(getdate()) as nvarchar(4))+'-01-01'
				end   
			end as lotdate,
		(select isnull(IDwarehouse,'8') from dbo.warehouse w where w.IDcompany = '846' and w.[desc] = [WH]) as idwhcsm,
		isnull(
		(select IDlocation   
		from [dbo].[warehouse_location] l where l.IDcompany = 846 and 
		l.IDwarehouse = (select isnull(IDwarehouse,'8') from dbo.warehouse w where w.IDcompany = '846' and w.[desc] = [WH])
		and l.[desc] = [Location]),
		/* Se è nullo leggo la prima ubicazione del magazzino */
		(select top 1 IDlocation 
		 from [dbo].[warehouse_location] ll 
		 where ll.IDcompany = 846 and ll.IDwarehouse = (select isnull(ww.IDwarehouse,'8') from dbo.warehouse ww where ww.IDcompany = '846' and ww.[desc] = [WH]))
		 )as idloccsm
from 
(
/* Selezione di tutti i "padri "*/
SELECT [Product Code],[Lot #] as lotOri, 
case when ( /* Se vedo che è uno step roll metto il "-0" davanti al lotto per riconoscerlo */
	ltrim(rtrim([b Dim 1  Ft  ])) <> '' or ltrim(rtrim([b Dim 2  in  ])) <>  '' or ltrim(rtrim([b Value  $  ])) <> '' or
	ltrim(rtrim([c Dim 1  Ft  ])) <> '' or ltrim(rtrim([c Dim 2  in  ])) <>  '' or ltrim(rtrim([c Value  $  ])) <> '' or
	ltrim(rtrim([d Dim 1  Ft  ])) <> '' or ltrim(rtrim([d Dim 2  in  ])) <>  '' or ltrim(rtrim([d Value  $  ])) <> '' or
	ltrim(rtrim([e Dim 1  Ft  ])) <> '' or ltrim(rtrim([e Dim 2  in  ])) <>  '' or ltrim(rtrim([e Value  $  ])) <> '' )
	then [Lot #]+'_0'else [Lot #] end as [Lot #],
[Invoice #],[WH],[Location],[Package or Cut roll #],[Pcs ],[a Dim 1  Ft  ],[a Dim 2  in  ], [a Value  $  ] --,[Note]
FROM [dbo].ZZZ_importExcelUSA20190722
union
/* Selezione step roll 1 */
SELECT [Product Code],[Lot #] as lotOri, [Lot #]+'_1',[Invoice #],[WH],[Location],[Package or Cut roll #],[Pcs ],[b Dim 1  Ft  ],[b Dim 2  in  ],[b Value  $  ] --,[Note]
FROM [dbo].ZZZ_importExcelUSA20190722
where ltrim(rtrim([b Dim 1  Ft  ])) <> '' and ltrim(rtrim([b Dim 2  in  ])) <>  '' and ltrim(rtrim([b Value  $  ])) <> ''
union
/* Selezione step roll 2 */
SELECT [Product Code],[Lot #] as lotOri, [Lot #]+'_2',[Invoice #],[WH],[Location],[Package or Cut roll #],[Pcs ],[c Dim 1  Ft  ],[c Dim 2  in  ],[c Value  $  ]--,[Note]
FROM [dbo].ZZZ_importExcelUSA20190722
where ltrim(rtrim([c Dim 1  Ft  ])) <> '' and ltrim(rtrim([c Dim 2  in  ])) <>  '' and ltrim(rtrim([c Value  $  ])) <> ''  
union
/* Selezione step roll 3 */
SELECT [Product Code],[Lot #] as lotOri, [Lot #]+'_3',[Invoice #],[WH],[Location],[Package or Cut roll #],[Pcs ],[d Dim 1  Ft  ],[d Dim 2  in  ],[d Value  $  ]--,[Note]
FROM [dbo].ZZZ_importExcelUSA20190722
where ltrim(rtrim([d Dim 1  Ft  ])) <> '' and ltrim(rtrim([d Dim 2  in  ])) <>  '' and ltrim(rtrim([d Value  $  ])) <> ''
union
/* Selezione step roll 4 */
SELECT [Product Code],[Lot #] as lotOri, [Lot #]+'_4',[Invoice #],[WH],[Location],[Package or Cut roll #],[Pcs ],[e Dim 1  Ft  ],[e Dim 2  in  ],[e Value  $  ]--,[Note]
FROM [dbo].ZZZ_importExcelUSA20190722
where ltrim(rtrim([e Dim 1  Ft  ])) <> '' and ltrim(rtrim([e Dim 2  in  ])) <>  '' and ltrim(rtrim([e Value  $  ])) <> ''
) exportTab
 where [Product Code] is not null
GO
/****** Object:  View [dbo].[vw_lotDimensionsPivot]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_lotDimensionsPivot] AS /*2020 04 16, vista utilizzata all'interno 
della vista parametrica dello stock viewer, in quanto 
le multiple jion sulla stessa tabella per recuperare 
tutte le dimensioni risultavano meno performanti */
SELECT IDcompany, IDlot, [LA],[LU],[PZ],[DE],[DI]
FROM  
(SELECT IDcompany, IDlot, IDcar, val from dbo.lot_dimension) AS t 
PIVOT(
	max(val) 
    FOR IDcar IN ([LA],[LU],[PZ],[DE],[DI])
) AS pivot_table
GO
/****** Object:  View [dbo].[vw_lot_last_value]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_lot_last_value] AS /*
Vado in inner join con la stessa tabella raggruppata per company-lotto e max data in modo da estrarre solo
l'ultimo record inserito per lotto

*/
  select lv.IDcompany, lv.IDlot, lv.date_ins, lv.UnitValue, lv.note
  from dbo.lot_value lv
  inner join 
  (/* Ultimo prezzo caricato per company\lotto */
  select h.IDcompany, h.IDlot, max(h.date_ins) dt
  from dbo.lot_value h
  group by h.IDcompany, h.IDlot) lastVal on lastVal.IDcompany = lv.IDcompany and lastVal.IDlot = lv.IDlot and lv.date_ins = lastVal.dt
GO
/****** Object:  View [dbo].[vw_lot_max_value]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_lot_max_value] AS /*
2020-04-28
Estrai il valore più alto che ogni lotto ha avuto, idealmente dovrebbe essere
il primo valore inserito, che poi verrà decrementato con le varie devalutazioni
(Richiesto per Chiorino America)

*/
  select lv.IDcompany, lv.IDlot, max(lv.UnitValue) as MaxUnitValue
  from dbo.lot_value lv
  group by lv.IDcompany, lv.IDlot
GO
/****** Object:  Table [dbo].[item_group]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[item_group](
	[item_group] [nvarchar](10) NOT NULL,
	[group_desc] [nvarchar](50) NULL,
	[IDcompany] [int] NULL,
	[id] [nvarchar](100) NOT NULL,
 CONSTRAINT [item_group_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[1111vw_lots_stock_value]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[1111vw_lots_stock_value] AS SELECT l.IDlot,item,item_desc,substring(convert(varchar, l.date_ins, 20),1,16) as date_ins , 
substring(convert(varchar, l.date_lot, 20),1,16) as date_lot,  
IDlot_fornitore, dbo.getDimByLot (l.IDcompany, l.IDlot) as dimensions , 
 wh.[desc] as whdesc, wh_lc.[desc] as lcdesc
 ,(qty_stock) as totStock 
 ,um
 ,case when checked_value = 0 then 'Unchecked' else 'Checked' end as CheckedVal
 /* se il valore non è stato controllato lo azzeriamo */
,case when checked_value = 0 then 0 else v.UnitValue end as UnitValue
,(qty_stock * (case when checked_value = 0 then 0 else v.UnitValue end)) as tval 
,i.item_group
,c.curr
,l.IDcompany
--2021-05-19, AB, richiesta discriminazione articoli chiorino e non chiorino 
, case when isnull(ig.item_group,'') <> '' then '0' else '1' end as ChiorinoItem
, case when conf_item = 0 then 'No' else 'Yes' end as conf_item
FROM dbo.stock s   
inner join dbo.vw_lot_last_value v on v.IDcompany = s.IDcompany and v.IDlot = s.IDlot  
inner join dbo.lot l on s.IDcompany = l.IDcompany and l.IDlot = s.IDlot  
inner join dbo.item i on i.IDitem = l.IDitem  
inner join dbo.warehouse wh on wh.IDcompany = s.IDcompany and s.IDwarehouse = wh.IDwarehouse 
inner join dbo.warehouse_location wh_lc on wh_lc.IDcompany = s.IDcompany and s.IDlocation = wh_lc.IDlocation
inner join dbo.company c on s.IDcompany = c.IDcompany
-- 2021-05-19, AB, richiesta discriminazione articoli chiorino e non chiorino (se c'è la fam su quella company è un articolo non chiorino) 
left outer join [dbo].[item_group] ig on ig.item_group = i.item_group and ig.IDcompany = s.IDcompany
GO
/****** Object:  View [dbo].[vw_stock_viewer]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- dbo.vw_stock_viewer source

CREATE VIEW [dbo].[vw_stock_viewer] AS /*
2020-04-03, AB, Questa vista viene utilizzata solo dal report di estrazione dello stock su excel
report_service_export_stock_all.php, in passato era utilizzata anche nella pagina principale
dello stock viewer, ma per questioni di performances la query ora è direttamente dentro alla 
Programmaility -> functions-> Table-valued ... parView_StockViewer.
Se vengono effettuate modifiche è necessario valutare l'allineamento.
2020-04-28, AB, Aggiunte le 2 viste per estrarre il valore massimo del lotto (valore all'unità)
e il valore attuale (cioù l'ultimo inserito) come da richiesta per chiorino america.
*/
select lot.IDlot, item.item, item.item_desc, item.um, wh.[desc] as whdesc, wh_lc.[desc] as lcdesc, IDlot_padre,
IDlot_origine, substring(convert(varchar, lot.date_lot, 20),1,10) as date_lot, qty_stock, stepRoll,
isnull(PZ,'') as PZ, isnull(LA,'') as LA, isnull(LU,'') as LU, isnull(DE,'') as DE, isnull(DI,'') as DI, 
(select count(*) from dbo.cutting_order_row c where c.IDcompany= stock.IDcompany and c.IDlot = lot.IDlot) as cutNum , lot.note, lot.ord_rif,
/* Filtri */
stock.IDcompany, lot.IDitem, item.item_group, stock.IDwarehouse, stock.IDlocation
/* Inventario: questi campi sono compilati solo se c'è un inventario attivo */
,IDinventory, invUsername, invDate_ins, IDstock,
(select COUNT(*) 
from dbo.order_production ord 
inner join dbo.order_production_components ordC on ord.IDord = ordC.IDord and ord.IDcompany = ordC.IDcompany 
where ord.IDlot = stock.IDlot and ord.IDcompany = stock.IDcompany
) as NumComp
, lot.eur1 as eur1
, lot.conf_item as conf_item  --2023-01-02 AB
, lot.merged_lot as merged_lot  --2023-02-28 AB
/* 2020 04 28 */
,lv.UnitValue * qty_stock as totValue
,lv.UnitValue
,mv.MaxUnitValue
, case when (isnull(mv.MaxUnitValue,0) = 0 or isnull(lv.UnitValue,0) = 0)  then 0 else lv.UnitValue / mv.MaxUnitValue end as DiffPercVal
,lv.note as ValueNote
/* 2020 07 22 Aggiunta data lotto origine */
,substring(convert(varchar, (select date_lot from dbo.lot lotOri where lotOri.IDcompany = lot.IDcompany and lotOri.IDlot = lot.IDlot_origine), 20),1,10) as dateLotOri
/* 2021 03 13, Aggiunto tipo di ubicazione (con valorizzata si\no) */
,wlt.tname as loc_type
, wlt.evaluated as loc_evaluated
from dbo.stock inner join lot on lot.IDcompany = stock.IDcompany and lot.IDlot = stock.IDlot 
inner join item on item.IDitem = lot.IDitem 
inner join warehouse wh on wh.IDcompany = stock.IDcompany and stock.IDwarehouse = wh.IDwarehouse 
inner join warehouse_location wh_lc on wh_lc.IDcompany = stock.IDcompany and stock.IDlocation = wh_lc.IDlocation
inner join warehouse_location_type wlt on wh_lc.IDwh_loc_Type = wlt.IDwh_loc_Type
/* 2020 04 28 (verificare se possibile utilizzare inner join) */
left outer join [dbo].[vw_lot_last_value] lv on lv.IDcompany = stock.IDcompany and lv.IDlot = stock.IDlot
left outer join [dbo].[vw_lot_max_value] mv on mv.IDcompany = stock.IDcompany and mv.IDlot = stock.IDlot
/* Non tutti gli articoli hanno tutte le dimensioni (2020-04-16 aggiunta pivot sulle dimensioni lotto) */
left outer join dbo.vw_lotDimensionsPivot dim on dim.IDcompany = stock.IDcompany and dim.IDlot = stock.IDlot;
GO
/****** Object:  View [dbo].[vw_lots_devaluation]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE view [dbo].[vw_lots_devaluation] as 
/*
Il lotto subisce 2 devalutazione,

- a 2 anni del 50%     (quindi tra 2 e 4)
- dopo i 4 dell 100 %  (quindi >= 4)

in anagrafica lotti abbiamo il campo "devaluation" che può contenere 
0 = nessuna devaltazione eseguita
2 = eseguita quella dei 2 anni al 50 %
4 = eseguita 
99 = escluso dalla devalutazione 

Note aggiuntive
- la data di riferimento è la date_lot del lotto origine (cioè il primissimo lotto ricevuto che ha poi dato vita al lotto attuale)
- un lotto deve tenere conto delle devalutazioni del lotti padri ... (quando creaiamo un nuovo lotto copiamo il campo devaluation 
dal padre per mantenere l'informazione)
- olte al campo devaluation copiamo anche il campo "checked_value"
- esludiamo tutti i lotti che non hanno il flag di valore confermato

- Su questa vista non ci sono fitri sulla data, nelle sessioni di gestione aggiungiamo la 
codizione sul valore, cioè escludiamo CurrentUnitValue = UnitValueDevalueted
(attenzione che alcuni possono avere il valore a zero)

*/
/* MEMO AGGIUNGERE !!!!!!   LA CONSIDERAZIONE DEL CAMPO devaluation   */
  select l.IDcompany, l.IDlot, 
  DATEDIFF(year, lori.date_lot, getutcdate()) AS YearsLot,
  l.devaluation,
  UnitValue as CurrentUnitValue,
  case when DATEDIFF(year, lori.date_lot, getutcdate()) >= 2 and DATEDIFF(year, lori.date_lot, getutcdate()) < 4 then
			case when l.devaluation <> 2 then /* Verifica che non sia già stato eseguita la devalutazione dei 2 anni  */
				UnitValue / 2	/* Per quelli più vecchi di 2 anni ma non oltre i 4 devalutiamo del 50 %*/
				else
				UnitValue
			end
	   when DATEDIFF(year, lori.date_lot, getutcdate()) >=4  then
			0				/* Per il lotti più vecchi di 4 anni azzeriamo il valore */
	   else
			UnitValue		/* Per i lotti che non superano i 2 anni di vita il valore rimane invariato */
	   end as UnitValueDevalueted,
    case when DATEDIFF(year, lori.date_lot, getutcdate()) >= 2 and DATEDIFF(year, lori.date_lot, getutcdate()) < 4 then
			case when l.devaluation <> 2 then /* Verifica che non sia già stato eseguita la devalutazione dei 2 anni  */
				2	/* Per quelli più vecchi di 2 anni ma non oltre i 4 devalutiamo del 50 %*/
				else
				0
			end
	   when DATEDIFF(year, lori.date_lot, getutcdate()) >=4  then
			4				/* Per il lotti più vecchi di 4 anni azzeriamo il valore */
	   else
			0		/* Per i lotti che non superano i 2 anni di vita il valore rimane invariato */
	   end as devaluation_type,	   
  i.item, i.item_desc, i.um, s.qty_stock, lori.date_lot, c.curr
  from dbo.lot l 
  inner join dbo.company c on l.IDcompany = c.IDcompany
  inner join dbo.stock s on l.IDcompany = s.IDcompany and l.IDlot = s.IDlot
  inner join dbo.item i on i.IDitem = l.IDitem
  inner join dbo.vw_lot_last_value v on l.IDcompany =  v.IDcompany and l.IDlot = v.IDlot
  /*join ricorsiva su lot per recupero date_lot del lotto origine */
  inner join dbo.lot lori on lori.IDcompany = l.IDcompany and lori.IDlot = l.IDlot_origine
  where l.checked_value = 1 
  and l.devaluation <> 99 /* il tipo 99 significa che è stato escluso dalla devalutazione */
GO
/****** Object:  View [dbo].[vw_comp_on_production_order]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_comp_on_production_order] AS /*
Vista utilizzata dalla "vista parametrica" dello stock viewer per 
il conteggio del numero di componenti
*/
select ord.IDcompany, ord.IDlot, count(ord.IDlot) as NumComp
from dbo.order_production ord 
inner join dbo.order_production_components ordC on ord.IDord = ordC.IDord and ord.IDcompany = ordC.IDcompany 
group by ord.IDcompany, ord.IDlot
GO
/****** Object:  View [dbo].[vw_cuts_on_cutting_order]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_cuts_on_cutting_order] AS /*
Vista utilizzata dalla "vista parametrica" dello stock viewer per 
il conteggio del numero di tagli
*/
select IDcompany, IDlot, IDlot_new, count(IDlot) as Ncut
from dbo.cutting_order_row c 
group by IDcompany, IDlot, IDlot_new
GO
/****** Object:  View [dbo].[1111vw_cutting_result]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE view [dbo].[1111vw_cutting_result] as  
  /*
  vista per analizzare gli scarti derivanti dal taglio 
  */
  select h.IDcompany, h.IDlot, i.item, i.item_desc, substring(convert(varchar, date_executed, 20),1,16) as date_executed, username, dbo.getM2ByLotLALUPZ(h.IDcompany, h.IDlot) as dad_qty,
  case when l.stepRoll = 0 then
	   dbo.getM2ByLotLALUPZ(h.IDcompany, h.IDlot)
	   else
	    (select sum(dbo.getM2ByLotLALUPZ(lsr.IDcompany, lsr.IDlot))
		 from lot lsr where IDlot_padre = l.IDlot_padre and stepRoll = 1)
	   end as dad_qty_sr
	   , r.LA * r.LU * r.PZ / 1000000 as son_qty
  from  dbo.cutting_order h  
  inner join dbo.cutting_order_row r on h.IDcompany = r.IDcompany and h.IDlot = r.IDlot
  inner join dbo.lot l on l.IDcompany = h.IDcompany and l.IDlot = h.IDlot
  inner join dbo.item i on i.IDitem = l.IDitem
  where executed = 1  /* solo per i tagli completati  */
GO
/****** Object:  Table [dbo].[bp]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[bp](
	[IDcompany] [int] NOT NULL,
	[IDbp] [nvarchar](100) NOT NULL,
	[desc] [nvarchar](100) NOT NULL,
	[supplier] [bit] NOT NULL,
	[customer] [bit] NOT NULL,
	[address_id] [nvarchar](100) NULL,
	[contact_id] [nvarchar](100) NULL,
	[business_registry_registration] [nvarchar](100) NULL,
	[currency_id] [varchar](3) NULL,
	[vat] [nvarchar](100) NULL,
	[language] [varchar](2) NULL,
	[bp_category_id] [varchar](100) NULL,
	[is_sales_destination] [tinyint] NULL,
	[is_shipping_destination] [tinyint] NULL,
	[is_invoice_destination] [tinyint] NULL,
	[is_sales_origin] [tinyint] NULL,
	[is_shipping_origin] [tinyint] NULL,
	[is_invoice_origin] [tinyint] NULL,
	[is_payment_destination] [tinyint] NULL,
	[naics_l1] [varchar](100) NULL,
	[naics_l2] [varchar](100) NULL,
	[naics_l3] [varchar](100) NULL,
	[sales_destination_address_id] [nvarchar](100) NULL,
	[sales_destination_contact_id] [nvarchar](100) NULL,
	[sales_destination_int_contact_id] [nvarchar](100) NULL,
	[sales_destination_ext_contact_id] [nvarchar](100) NULL,
	[sales_destination_terms_of_delivery] [nvarchar](100) NULL,
	[sales_destination_has_chiorino_stamp] [tinyint] NULL,
	[shipping_destination_address_id] [nvarchar](100) NULL,
	[shipping_destination_contact_id] [nvarchar](100) NULL,
	[shipping_destination_carrier_bp_id] [nvarchar](100) NULL,
	[invoice_destination_address_id] [nvarchar](100) NULL,
	[invoice_destination_contact_id] [nvarchar](100) NULL,
	[payment_destination_address_id] [nvarchar](100) NULL,
	[payment_destination_contact_id] [nvarchar](100) NULL,
	[sales_origin_address_id] [nvarchar](100) NULL,
	[sales_origin_contact_id] [nvarchar](100) NULL,
	[sales_origin_pm_contact_id] [nvarchar](100) NULL,
	[shipping_origin_address_id] [nvarchar](100) NULL,
	[shipping_origin_contact_id] [nvarchar](100) NULL,
	[shipping_origin_carrier_bp_id] [nvarchar](100) NULL,
	[shipping_origin_has_inspection] [tinyint] NULL,
	[invoice_origin_address_id] [nvarchar](100) NULL,
	[invoice_origin_contact_id] [nvarchar](100) NULL,
 CONSTRAINT [bp_PK] PRIMARY KEY CLUSTERED 
(
	[IDbp] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_lots_value]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_lots_value] AS select stock.IDcompany, lot.IDlot, IDlot_fornitore, item.item, item.item_desc, qty_stock,  item.um, 
IDlot_origine, 
isnull(bp.[desc],'') as bpdesc,
substring(convert(varchar, lot.date_lot, 20),1,10) as date_lot,
case when isnull(v.UnitValue,0) = 0 then 0 else
v.UnitValue * qty_stock
end as val
from dbo.stock 
inner join dbo.lot  on lot.IDcompany = stock.IDcompany and lot.IDlot = stock.IDlot 
inner join dbo.item on item.IDitem = lot.IDitem 
left outer join dbo.bp   on bp.IDcompany = stock.IDcompany and bp.IDbp = lot.IDbp
left outer join dbo.vw_lot_last_value v on v.IDcompany = stock.IDcompany and v.IDlot = stock.IDlot
GO
/****** Object:  View [dbo].[zzz_vw_lots_unchecked_value]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[zzz_vw_lots_unchecked_value] AS SELECT l.IDlot,item,item_desc,substring(convert(varchar, l.date_ins, 20),1,16) as date_ins , 
substring(convert(varchar, l.date_lot, 20),1,16) as date_lot, um, 
IDlot_fornitore, dbo.getDimByLot (l.IDcompany, l.IDlot) as dimensions ,isnull(bp.[desc],'') as bpdesc,v.UnitValue 
,sum((qty_stock * v.UnitValue)) as tval  
,sum(qty_stock) as totStock 
,l.IDcompany
,l.ord_rif
FROM dbo.lot l  
inner join dbo.vw_lot_last_value v on v.IDcompany = l.IDcompany and v.IDlot = l.IDlot  
inner join dbo.stock s on s.IDcompany = l.IDcompany and l.IDlot = s.IDlot  
inner join dbo.item i on i.IDitem = l.IDitem  
left outer join dbo.bp on bp.IDcompany = l.IDcompany and bp.IDbp = l.IDbp  
where checked_value = 0  
group by l.IDlot,item,item_desc,substring(convert(varchar, l.date_ins, 20),1,16), substring(convert(varchar, l.date_lot, 20),1,16), um,  
IDlot_fornitore, dbo.getDimByLot (l.IDcompany, l.IDlot) ,isnull(bp.[desc],''),v.UnitValue	,l.IDcompany, l.ord_rif
GO
/****** Object:  Table [dbo].[zETL_LN_lot_dimension_from_biella]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[zETL_LN_lot_dimension_from_biella](
	[IDcompany] [int] NOT NULL,
	[t_deln] [nvarchar](19) NOT NULL,
	[t_shpm] [nvarchar](9) NOT NULL,
	[t_pono] [int] NULL,
	[item_std] [nvarchar](47) NOT NULL,
	[IDlot] [nvarchar](20) NOT NULL,
	[IDcar] [nvarchar](3) NOT NULL,
	[val] [float] NOT NULL
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_zETL_LN_lot_dimension_from_biellaPivot]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_zETL_LN_lot_dimension_from_biellaPivot] AS /*2021 03 27, View utilizzata all'interno
della pagina per ricevere i lotti chiorino
inserendo il numero del DDT */
SELECT IDcompany, t_deln, t_shpm, t_pono, IDlot, [LA],[LU],[PZ],[DE],[DI]
FROM  
(SELECT IDcompany, t_deln, t_shpm, t_pono, IDlot, IDcar, val from [dbo].[zETL_LN_lot_dimension_from_biella]) AS t 
PIVOT(
	max(val) 
    FOR IDcar IN ([LA],[LU],[PZ],[DE],[DI])
) AS pivot_table
GO
/****** Object:  UserDefinedFunction [dbo].[parView_lotValueToCheck]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_lotValueToCheck] (
@IDcompany int,
/*Filtri su testo solo "like" */
@IDlot nvarchar(20),
@IDlot_fornitore nvarchar(20),
@item nvarchar(47),
@itemDesc nvarchar(47),
@BPdesc nvarchar(100),
@Whdesc nvarchar(100),
/*Parametri pagining tabella*/
@offset int, @fetchNext int
)
RETURNS TABLE
AS
RETURN
/* Per semplificare il caricamento cerchiamo il primo magazzino di carico del lotto, cosi, ad esempio i francesi
si vedono i loro lotti in ogni branch. Memo, non "possiamo" mettere il magazzino di giacenza in quanto i lotti frazionabili
potrebbero essere su più magazzini */

select IDlot, IDlot_fornitore, item, item_desc, date_ins, date_lot, um, dimensions, bpdesc, UnitValue, tval, totStock, ord_rif, loadedWhDesc
from 
(
SELECT l.IDlot,item,item_desc,substring(convert(varchar, l.date_ins, 20),1,16) as date_ins , 
substring(convert(varchar, l.date_lot, 20),1,16) as date_lot, um, 
IDlot_fornitore, dbo.getDimByLotShortDesc (l.IDcompany, l.IDlot) as dimensions ,isnull(bp.[desc],'') as bpdesc,v.UnitValue 
,sum((qty_stock * v.UnitValue)) as tval  
,sum(qty_stock) as totStock 
,l.ord_rif
,[dbo].[getLoadedWarehouseByLot] (l.IDcompany, l.IDlot) as loadedWhDesc
FROM dbo.lot l  
inner join dbo.vw_lot_last_value v on v.IDcompany = l.IDcompany and v.IDlot = l.IDlot  
inner join dbo.stock s on s.IDcompany = l.IDcompany and l.IDlot = s.IDlot  
inner join dbo.item i on i.IDitem = l.IDitem  
left outer join dbo.bp on bp.IDcompany = l.IDcompany and bp.IDbp = l.IDbp  
where l.IDcompany = @IDcompany and checked_value = 0  
/* filtri su testi, eseguiti sempre stile like (senza possibilità di scegliere = o *) */
and dbo.checkValueByCondition('*','char', l.IDlot, @IDlot) = 1
and dbo.checkValueByCondition('*','char', IDlot_fornitore,@IDlot_fornitore) = 1
and dbo.checkValueByCondition('*','char', item, @item) = 1
and dbo.checkValueByCondition('*','char', item_desc, @itemDesc) = 1
and dbo.checkValueByCondition('*','char', isnull(bp.[desc],''), @BPdesc) = 1
group by l.IDlot,item,item_desc,substring(convert(varchar, l.date_ins, 20),1,16), substring(convert(varchar, l.date_lot, 20),1,16), um,  
		IDlot_fornitore, dbo.getDimByLot (l.IDcompany, l.IDlot) ,isnull(bp.[desc],''),v.UnitValue	,l.IDcompany, l.ord_rif
) GroupedTabled

/* Lo mettiamo qui per leggero una singola volta, e non leggerlo 2 volte per ogni record, 1 per metterlo a video e una per 
verificare al codinzione */
where dbo.checkValueByCondition('*','char', loadedWhDesc, @Whdesc) = 1
order by IDlot
offset @offset rows fetch next @fetchNext rows only
GO
/****** Object:  Table [dbo].[item_enabled]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[item_enabled](
	[IDcompany] [int] NOT NULL,
	[IDitem] [nvarchar](100) NULL,
	[altv_code] [nvarchar](47) NULL,
	[altv_desc] [nvarchar](100) NULL,
	[id] [nvarchar](100) NOT NULL,
 CONSTRAINT [item_enabled_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  UserDefinedFunction [dbo].[parView_SelectItem]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create FUNCTION [dbo].[parView_SelectItem] (
@IDcompany int,
/*Filtri su testo solo "like" */
@item nvarchar(47), 
@desc nvarchar(100), 
/*Parametri pagining tabella*/
@offset int, @fetchNext int
)
RETURNS TABLE
AS
RETURN
/*
Utilizzata in 
- receipt_select_item.php
- adjustments_select_item.php
*/
select i.IDitem, i.item, i.item_desc, i.um, i.item_group 
from dbo.item i 
inner join dbo.item_enabled ie on ie.IDcompany = @IDcompany
and ie.IDitem = i.IDitem  
where i.IDcompany in (0, @IDcompany)
/* filtri su testi, eseguiti sempre stile like (senza possibilità di scegliere = o *)*/
and dbo.checkValueByCondition('*','char', item, @item) = 1
and dbo.checkValueByCondition('*','char', item_desc,@desc) = 1
order by item_desc
offset @offset rows fetch next @fetchNext rows only
GO
/****** Object:  UserDefinedFunction [dbo].[parView_receiptSelectSupplier]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_receiptSelectSupplier] (
@IDcompany int,
/*Filtri su testo solo "like" */
@BPdesc nvarchar(100), 
/*Parametri pagining tabella*/
@offset int, @fetchNext int
)

RETURNS TABLE
AS
RETURN
SELECT IDcompany, IDbp, [desc] 
FROM dbo.bp 
where supplier = 1 and bp.IDcompany = @IDcompany
/* filtri su testi, eseguiti sempre stile like (senza possibilità di scegliere = o *)*/
and dbo.checkValueByCondition('*','char', [desc],@BPdesc) = 1
order by [desc]
offset @offset rows fetch next @fetchNext rows only
GO
/****** Object:  UserDefinedFunction [dbo].[parView_stockValueAtDate_20200409]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/****** Script for SelectTopNRows command from SSMS  ******/

CREATE FUNCTION [dbo].[parView_stockValueAtDate_20200409] (@IDcompany int, @atDate datetime)
RETURNS TABLE
AS
RETURN
   select item, item_desc, item_group, um, curr, sum([qty]) as qty, sum(lotVal) as tval from 
   (
		   select LotToDate.IDcompany, LotToDate.IDlot, i.item, i.item_desc, i.item_group, i.um, c.curr, LotToDate.[qty],
		   LotToDate.[qty] * 
		   /* Recupero del primo precedente valore alla data inserita */
		   case when l.checked_value = 1 and l.checked_value_date <= @atDate  then  /* Che il valore sia checked, e in quella data fosse stato checked */
					isnull((select top 1 UnitValue 
							from [dbo].[lot_value] lv 
							where lv.IDcompany =  LotToDate.IDcompany and  lv.IDlot = LotToDate.IDlot and lv.date_ins <= @atDate
							order by date_ins desc),0) 		
		   else  0 end as lotVal
		   from(
					/* Estrazione dei lotti a stock alla data, questa è "l'estrazione" base, joiniamo le altre
					tabelle su questa in modo da joinare meno record */	
					SELECT IDcompany, IDlot, sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) as [qty]
					FROM dbo.transactions
					where IDcompany = @IDcompany 
					and [date_tran] < = @atDate
					group by IDcompany, IDlot
					/* L'having esclude tutti i lotti che sono stati azzerati */
					having sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) > 0
		   ) LotToDate 
		  inner join dbo.company c on c.IDcompany = LotToDate.IDcompany
		  inner join dbo.lot l on l.IDcompany = LotToDate.IDcompany and l.IDlot = LotToDate.IDlot
		  inner join dbo.item i on i.IDitem = l.IDitem
  ) LotToDateGrpByI
  group by item, item_desc, item_group, um, curr
GO
/****** Object:  Table [dbo].[um]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[um](
	[IDdim] [nvarchar](5) NOT NULL,
	[desc] [nvarchar](35) NULL,
	[frazionabile] [bit] NULL,
	[decimal_on_stock_qty] [bit] NOT NULL,
 CONSTRAINT [um_PK] PRIMARY KEY CLUSTERED 
(
	[IDdim] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_LN_anagraficaArticoli]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_LN_anagraficaArticoli] AS /* anagrafica articoli */
/*

Alcuni MEMO su UNITA' DI MISURA: 
Su ln gli RV vengono gestiti a dm3, qui li gestiremo a NP (number of pipes: de, di, la, pz .... e si gestirà solo i pz)
Su ln gli DR vengono gestiti a m2 ma con anche lo spessore, qui li gestiremo a NP (number of pipes: de, di, la, pz .... e si gestirà solo i pz)
Su ln gli CN vengono gestiti a m2 ma con anche lo spessore, qui li gestiremo a NP (number of pipes: de, di, la, pz .... e si gestirà solo i pz)
Su ln gli MN vengono gestiti a m2 ma con anche lo spessore, qui li gestiremo a NP (number of pipes: de, di, la, pz .... e si gestirà solo i pz)
Su ln gli ES e GM sono gestiti a m lineare, anche qui li gestiremo così ma senza considerare i pezzi.

*/
select	
		--id generato dal sistema
		ltrim(ltrim(t_item)) as item,
		t_dsca as item_desc,
		case when t_ctyp = 'RV' then 'NP'
			 when t_ctyp = 'DR' then 'NP'
			 when t_ctyp = 'CN' then 'NP'
			 when t_ctyp = 'MN' then 'NP'
			 when t_ctyp = 'AR' and t_cuni = 'NUM' then 'N'  /* 2021-09-03 per gli AR */
			 else t_cuni end 
		as UM,
		t_ctyp as item_group		
from	[ERP-DB02\ERPLN].[erplndb].dbo.ttcibd001815 ttcibd001815
where	--SUBSTRING(t_item,10,2) in ('MG','PC')   /* Performances peggiori */
		--(t_item not like '         PC%' or 
		-- t_item not like '         UV%' or 
		-- t_item not like '         UT%' or
		-- t_item not like '         UF%' or
		-- t_item not like '         VE%' or 
		-- t_item not like '         XP%' or 
		-- t_item not like '         XV%' or 
		-- t_item not like '         UC%') and
	 t_dscb = ''       -- no configurati
	 and t_kitm <> 3   -- no art. generici
	 and ltrim(rtrim(t_ctyp)) not in ('SB','SC','ST','TT','FT','MD','MG','PC','MS','PU','ED','TS','CL','UV', 'XP','XE','XF','SL','ZZ','XV', '')
	 /* Solo articolo con UM gestita dall'applicazione + I DM3 che li convertiamo in NP + gli AR che da NUM li mettiamo a N */
	 and t_cuni COLLATE DATABASE_DEFAULT in (select IDdim from um union select 'dm3' union select 'NUM')
GO
/****** Object:  UserDefinedFunction [dbo].[1111parView_stockValueAtDate]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[1111parView_stockValueAtDate] (@IDcompany int, @atDate datetime)
RETURNS TABLE
AS
RETURN
   select IDitem, item, item_desc, item_group, um, curr, sum([qty]) as qty, sum(lotVal) as tval, 
    isnull((select sum(tr1.qty) /* Qty venduta nel mese precedente alla data inserita */
	from transactions tr1
	inner join lot l1 on tr1.IDcompany = l1.IDcompany and tr1.IDlot = l1.IDlot
	where tr1.IDcompany = @IDcompany
	and tr1.date_tran between DATEADD(day, -30, @atDate) and @atDate  /* prendendo base 1 mese dalla data di lancio */
	and tr1.IDtrantype = 3 /*Sales*/
	and l1.IDitem = LotToDateGrpByI.IDitem),0) as qty_sold_1mm,
	isnull((select sum(tr1.qty)
	from transactions tr1
	inner join lot l1 on tr1.IDcompany = l1.IDcompany and tr1.IDlot = l1.IDlot
	where tr1.IDcompany = @IDcompany
	and tr1.date_tran between DATEADD(day, -90, @atDate) and @atDate  /* prendendo base 1 mese dalla data di lancio */
	and tr1.IDtrantype = 3 /*Sales*/
	and l1.IDitem = LotToDateGrpByI.IDitem),0) / 3 as qty_sold_3mm,
    isnull((select sum(tr12.qty)
	from transactions tr12
	inner join lot l12 on tr12.IDcompany = l12.IDcompany and tr12.IDlot = l12.IDlot
	where tr12.IDcompany = @IDcompany
	and tr12.date_tran between DATEADD(day, -365, @atDate) and @atDate /* prendendo base 1 mese dalla data di lancio */
	and tr12.IDtrantype = 3 /*Sales*/
	and l12.IDitem = LotToDateGrpByI.IDitem),0) / 12 as qty_sold_12mm  
   from 
   (
		   select LotToDate.IDcompany, LotToDate.IDlot, i.IDitem, i.item, i.item_desc, i.item_group, i.um, c.curr, LotToDate.[qty],
		   LotToDate.[qty] * 
		   /* Recupero del primo precedente valore alla data inserita */
		   case when l.checked_value = 1 and l.checked_value_date <= @atDate  then  /* Che il valore sia checked, e in quella data fosse stato checked */
					isnull((select top 1 UnitValue 
							from [dbo].[lot_value] lv 
							where lv.IDcompany =  LotToDate.IDcompany and  lv.IDlot = LotToDate.IDlot and lv.date_ins <= @atDate
							order by date_ins desc),0) 		
		   else  0 end as lotVal
		   from(
					/* Estrazione dei lotti a stock alla data, questa è "l'estrazione" base, joiniamo le altre
					tabelle su questa in modo da joinare meno record */	
					SELECT IDcompany, IDlot, sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) as [qty]
					FROM dbo.transactions
					where IDcompany = @IDcompany 
					and [date_tran] < = @atDate
					group by IDcompany, IDlot
					/* L'having esclude tutti i lotti che sono stati azzerati */
					having sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) > 0
		   ) LotToDate 
		  inner join dbo.company c on c.IDcompany = LotToDate.IDcompany
		  inner join dbo.lot l on l.IDcompany = LotToDate.IDcompany and l.IDlot = LotToDate.IDlot
		  inner join dbo.item i on i.IDitem = l.IDitem
  ) LotToDateGrpByI
  group by IDitem, item, item_desc, item_group, um, curr
GO
/****** Object:  View [dbo].[vw_zETL_LN_sales_order_open]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_zETL_LN_sales_order_open] AS /*	
	2023-01-31, AB, Open order from Biella.
	- Performances: eseguiti vari tentativi per ottimizzare la query, con openquery verso ln db, e\o creando un db sull'
	instanza di LN, non ci sono stati sensibili miglioramenti.
	L'esecuzione con le migliori perf. è direttamente su DB LN con ID BP static (non con select su db csm).
*/
WITH base_sls_order
AS (
	select h.t_ofbp, r.t_orno, r.t_pono, r.t_sqnb, 
	r.t_item,
	case when ltrim(rtrim(i.t_dscb)) = '' then rtrim(ltrim(r.t_item)) else ltrim(rtrim(i.t_dscb)) end as t_item_std, 
	case when ltrim(rtrim(i.t_dscb)) = '' then 0 else 1 end as cfg, 
	t_qoor, max(r.t_sqnb) Over (Partition By r.t_orno, r.t_pono) as max_sqnb
	,r.t_corn as ord_bp_row, h.t_corn ord_bp_head,
	r.t_dim1_c, r.t_dim2_c, r.t_dim3_c, r.t_dim4_c, r.t_dim5_c, r.t_cpva, r.t_clyn, r.t_term,
	i.t_cuni as UM_LN,
    case when i.t_ctyp = 'RV' then 'NP' /* Logica presente anche in [vw_LN_anagraficaArticoli] */
		 when i.t_ctyp = 'DR' then 'NP'
		 when i.t_ctyp = 'CN' then 'NP'
		 when i.t_ctyp = 'MN' then 'NP'
		 when i.t_ctyp = 'AR' and i.t_cuni = 'NUM' then 'N'  /* 2021-09-03 per gli AR */
		 else 
			 case when ltrim(rtrim(i.t_dscb)) = '' then i.t_cuni else i2.t_cuni end 
	  	 end as UM_CSM
		 ,r.t_prdt_c
		 ,r.t_ddta
	from	        [ERP-DB02\ERPLN].[erplndb].dbo.ttdsls400815 h 
	inner join      [ERP-DB02\ERPLN].[erplndb].dbo.ttdsls401815 r on h.t_orno = r.t_orno
	inner join      [ERP-DB02\ERPLN].[erplndb].dbo.ttcibd001815 i on i.t_item = r.t_item
	left outer join [ERP-DB02\ERPLN].[erplndb].dbo.ttcibd001815 i2 on ltrim(rtrim(i2.t_item)) = ltrim(rtrim(i.t_dscb)) -- Per estrarre UM degli item std da configurati
	where h.t_ofbp COLLATE DATABASE_DEFAULT in (select LN_bpid_code FROM dbo.company where IDcompany <> 0)
	and r.t_prdt_c <> '1970-01-01 00:00:00.000'
	and i.t_kitm <> 3   -- no articoli generici
	and i.t_ctyp not in ('CA', 'UC', 'UV')			/* Escludiamo famiglie di costo o comunque non utilizzabili su CSM */
	and h.t_hdst not in (2, 5, 30,35, 40) 
	),ship as (
	select t_worn, t_wpon, t_wseq, 
		   case when r.t_shst in (1,2,90,91) then sum(t_qshp) end as boxed_qty_UM_LN,         -- 1 open, 90 re.open pack, 91 re.open ship
		   case when r.t_shst in (20, 9, 93) then  sum(t_qshp) end as  shipping_qty_UM_LN,  -- 20 confirming, 94 on copletetion , 93 programmed
		   case when r.t_shst in (3) then  sum(t_qshp) end as  delivered_qty_UM_LN,          -- 3 confirmed
		   case when r.t_shst not in (1,2,90,91,20, 9, 93,3) then sum(t_qshp) end as deliver_undefined_qty_UM_LN
	from	   [ERP-DB02\ERPLN].[erplndb].dbo.twhinh430815 h
	inner join [ERP-DB02\ERPLN].[erplndb].dbo.twhinh431815 r on h.t_shpm = r.t_shpm
	where t_worg = 1 
	and t_ofbp COLLATE DATABASE_DEFAULT in (select LN_bpid_code FROM dbo.company where IDcompany <> 0)
	/* Le spedizioni possono essere suddivise ... */
	group by t_worn, t_wpon, t_wseq, r.t_shst
)
, dims_configured as (
	/* item configurati "normali"*/
	select  t_cpva, [LARGHEZZA],[LUNGHEZZA],[NUMERO],[DIAM_INTERNO],[DIAM_ESTERNO]
	from 
	(select t_cpva, t_cpft, t_copt from [ERP-DB02\ERPLN].[erplndb].dbo.ttipcf520815) as t 
	PIVOT (max (t_copt) 
		for t_cpft in ([LARGHEZZA],[LUNGHEZZA],[NUMERO],[DIAM_INTERNO],[DIAM_ESTERNO])
	) as pivot_table
)
, dims_configured_std as (
	/* item configurati "normali"*/
	select  t_item, [LARGHEZZA],[LUNGHEZZA],[NUMERO],[DIAM_INTERNO],[DIAM_ESTERNO]
	from 
	(select t_item, t_cpft, t_copt from [ERP-DB02\ERPLN].[erplndb].dbo.ttipcf560815) as t 
	PIVOT (max (t_copt) 
		for t_cpft in ([LARGHEZZA],[LUNGHEZZA],[NUMERO],[DIAM_INTERNO],[DIAM_ESTERNO])
	) as pivot_table
)
select so.t_ofbp, so.t_orno, so.t_pono, so.t_sqnb, so.max_sqnb, so.t_item, t_item_std, cfg, UM_CSM, UM_LN, t_qoor, ord_bp_row,  t_prdt_c, t_ddta,
	isnull(boxed_qty_UM_LN,0) as boxed_qty_UM_LN, 
	isnull(shipping_qty_UM_LN,0) as shipping_qty_UM_LN, 
	isnull(delivered_qty_UM_LN,0) as delivered_qty_UM_LN, 
	isnull(t_qoor - delivered_qty_UM_LN,0) as leftovery_UM_LN,
	cast(case when cfg = 1 then 
			case when isnull(dc.LARGHEZZA,'') = '' then isnull(dcs.LARGHEZZA,'') else dc.LARGHEZZA end
		 else t_dim1_c end as float) as LA,
	cast(case when cfg = 1 then 
			case when isnull(dc.LUNGHEZZA,'') = '' then isnull(dcs.LUNGHEZZA,'') else dc.LUNGHEZZA end
		 else t_dim2_c end as float) as LU,
	cast(case when cfg = 1 then 
			case when isnull(dc.NUMERO,'') = '' then isnull(dcs.NUMERO,'') else dc.NUMERO end
		else 
			 case when isnull(t_dim3_c,'') = '' then t_qoor else t_dim3_c end end as float) as PZ,
	cast(case when cfg = 1 then 
			case when isnull(dc.DIAM_ESTERNO,'') = '' then isnull(dcs.DIAM_ESTERNO,'') else dc.DIAM_ESTERNO end
		else t_dim4_c end  as float) as DE,
	cast(case when cfg = 1 then 
			case when isnull(dc.DIAM_INTERNO,'') = '' then isnull(dcs.DIAM_INTERNO,'') else dc.DIAM_INTERNO end
		 else t_dim5_c end  as float) as DI	
from base_sls_order so
left outer join ship s on so.t_orno = s.t_worn and so.t_pono = s.t_wpon and so.t_sqnb = s.t_wseq
/* Attenzione alla gestione delle dime 1_c ecc, ci dovrebbe essere una tabella dedicata */
left outer join dims_configured dc on so.t_cpva = dc.t_cpva
left outer join dims_configured_std dcs on so.t_item = dcs.t_item
where t_sqnb = max_sqnb     -- seq. massima presente (se c'è quella più alta le precedenti sono evase o cmq non da considerare)
and isnull(delivered_qty_UM_LN, 0) < t_qoor -- qty sped. sulla specifica seq minore di quella ordinata
and t_clyn = 2 -- non annullato 
and t_term = 2 -- non terminato;
GO
/****** Object:  UserDefinedFunction [dbo].[parView_StockViewer_20200412]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create FUNCTION [dbo].[parView_StockViewer_20200412] (
/* 2020 02 07, 
 funzione per l'estrazione dati della pagina stock viewer.
 Questa funzione estrae paginando l'estrazione, per lanciare la funzione:
select * from [dbo].[parView_StockViewer](845,					
										 '','','','','','','',								    --Filtri su testo solo "like"
										 '','','','',										    --Filtri testo con like oppure con l'=    
										 '100','<','','','','','','','','','','','','','','',   --Filtri con i valori numerici 
										 1,'asc',0,1000)									     --Parametri pagining tabella
 2020 04 03,
 Abbiamo escluso la vista (vw_stock_viewer) all'interno di questa function per 
 questioni di performances inserendo direttamente la query, la vecchia view
 rimane utilizzata per l'estrazione completa dello stock su excel con la 
 pagina web report_service_export_stock_all.php (se vengono effettuate modifiche
 all'interno di questa function è necessario valutare la modifica anche 
 della vecchia vista)
*/

@IDcompany int,
/*Filtri su testo solo "like" */
@whdesc nvarchar(100), 
@lcdesc nvarchar(100),
@um nvarchar(3),
@IDlot nvarchar(20),
@IDlot_origine nvarchar(20),
@stepRoll nvarchar(3),
@eur1 nvarchar(3),
@ord_rif nvarchar(100),

/* Filtri testo con like oppure con l'=    */
@item nvarchar(47),
@itemC nvarchar(2),
@itemDesc nvarchar(47),
@itemDescC nvarchar(2),
/* Filtri con i valori numerici */
@la nvarchar(50),
@laC nvarchar(2),
@lu nvarchar(50),
@luC nvarchar(2),
@pz nvarchar(50),
@pzC nvarchar(2),
@de nvarchar(50),
@deC nvarchar(2),
@di nvarchar(50),
@diC nvarchar(2),
@ncut nvarchar(50),
@ncutC nvarchar(2),
@qty nvarchar(50),
@qtyC nvarchar(2),
@lotDate nvarchar(50),
@lotDateC nvarchar(2),
/*Parametri pagining tabella*/
@orderBy int, @ascDesc nvarchar(5), @offset int, @fetchNext int
)

RETURNS TABLE
AS
RETURN
select lot.IDlot, IDlot_origine, item.item, item.item_desc, wh.[desc] as whdesc, wh_lc.[desc] as lcdesc,
isnull(la.val,'') as LA, isnull(lu.val,'') as LU, isnull(pz.val,'') as PZ,  isnull(de.val,'') as DE, isnull(di.val,'') as DI, 
(select count(*) from dbo.cutting_order_row c where c.IDcompany= stock.IDcompany and c.IDlot = lot.IDlot) as cutNum, qty_stock, item.um,  
substring(convert(varchar, lot.date_lot, 20),1,10) as date_lot, 
case when stepRoll = 0 then 'No' else 'Yes' end as stepRoll,
lot.ord_rif, stock.IDwarehouse, stock.IDlocation, lot.note
,IDinventory, IDstock,
(select COUNT(*) 
from dbo.order_production ord 
inner join dbo.order_production_components ordC on ord.IDord = ordC.IDord and ord.IDcompany = ordC.IDcompany 
where ord.IDlot = stock.IDlot and ord.IDcompany = stock.IDcompany
) as NumComp
,case when lot.eur1 = 0 then 'No' else 'Yes' end as eur1
from dbo.stock 
inner join lot on lot.IDcompany = stock.IDcompany and lot.IDlot = stock.IDlot 
inner join item on item.IDitem = lot.IDitem 
inner join warehouse wh on wh.IDcompany = stock.IDcompany and stock.IDwarehouse = wh.IDwarehouse 
inner join warehouse_location wh_lc on wh_lc.IDcompany = stock.IDcompany and stock.IDlocation = wh_lc.IDlocation
/* Non tutti gli articoli hanno tutte le dimensioni */
left outer join dbo.lot_dimension la on la.IDcompany = stock.IDcompany and la.IDlot = stock.IDlot and la.IDcar = 'LA' 
left outer join dbo.lot_dimension lu on lu.IDcompany = stock.IDcompany and lu.IDlot = stock.IDlot and lu.IDcar = 'LU' 
left outer join dbo.lot_dimension pz on pz.IDcompany = stock.IDcompany and pz.IDlot = stock.IDlot and pz.IDcar = 'PZ' 
left outer join dbo.lot_dimension de on de.IDcompany = stock.IDcompany and de.IDlot = stock.IDlot and de.IDcar = 'DE' 
left outer join dbo.lot_dimension di on di.IDcompany = stock.IDcompany and di.IDlot = stock.IDlot and di.IDcar = 'DI' 

where stock.IDcompany = @IDcompany
/* Filtri testo con like oppure con l'=    */ 
and dbo.checkValueByCondition(@itemC,'char', replace(lower(item), ' ',''), replace(lower(@item), ' ','')) = 1
and dbo.checkValueByCondition(@itemDescC,'char', replace(lower(item_desc), ' ',''), replace(lower(@itemDesc), ' ','')) = 1 
/* Filtri con >, >= ecc .. ci appoggiamo alla funzione per verificare la codizione,
qui non era possibile usare il parametro come condizione(>,<...) */
and dbo.checkValueByCondition(@laC,'float', isnull(la.val,''), @la) = 1   
and dbo.checkValueByCondition(@luC,'float', isnull(lu.val,''), @lu) = 1  
and dbo.checkValueByCondition(@pzC,'float', isnull(pz.val,''), @pz) = 1
and dbo.checkValueByCondition(@deC,'float', isnull(de.val,''), @de) = 1
and dbo.checkValueByCondition(@diC,'float', isnull(di.val,''), @di) = 1
and dbo.checkValueByCondition(@ncutC,'float', (select count(*) from dbo.cutting_order_row c where c.IDcompany= stock.IDcompany and c.IDlot = lot.IDlot), @ncut) = 1
and dbo.checkValueByCondition(@qtyC,'float', qty_stock, @qty) = 1    
and dbo.checkValueByCondition(@lotDateC,'date', date_lot, @lotDate) = 1

/* filtri su testi, eseguiti sempre stile like */
and (@whdesc				= '' or CHARINDEX(replace(lower(@whdesc), ' ',''), replace(lower(wh.[desc]), ' ','')) > 0) 
and (ltrim(rtrim(@lcdesc))	= '' or CHARINDEX(replace(lower(@lcdesc), ' ',''), replace(lower(wh_lc.[desc]), ' ','')) > 0 )  
and (@um					= '' or CHARINDEX(replace(lower(@um), ' ',''), replace(lower(um), ' ','')) > 0) 
and (@IDlot					= '' or CHARINDEX(replace(lower(@IDlot), ' ',''), replace(lower(stock.IDlot), ' ','')) > 0)  
and (@IDlot_origine			= '' or CHARINDEX(replace(lower(@IDlot_origine), ' ',''), replace(lower(IDlot_origine), ' ','')) > 0) 
and (@stepRoll				= '' or CHARINDEX(lower(@stepRoll), (case when lot.stepRoll = 0 then 'no' else 'yes' end)) > 0) 
and (@eur1				    = '' or CHARINDEX(lower(@eur1), (case when lot.eur1 = 0 then 'no' else 'yes' end)) > 0)
and (@ord_rif				= '' or CHARINDEX(@ord_rif, ord_rif) > 0) 

order by  
/* Le function non accettano variabile numeriche come parametro di order by,
gestiamo la problematica con l'utilizzo dei case */
case when @orderBy = 1 and @ascDesc = 'asc' then stock.IDlot end asc,
case when @orderBy = 1 and @ascDesc = 'desc' then stock.IDlot end desc,
case when @orderBy = 2 and @ascDesc = 'asc' then IDlot_origine end asc,
case when @orderBy = 2 and @ascDesc = 'desc' then IDlot_origine end desc,
case when @orderBy = 3 and @ascDesc = 'asc' then item end asc,
case when @orderBy = 3 and @ascDesc = 'desc' then item end desc,
case when @orderBy = 4 and @ascDesc = 'asc' then item_desc  end asc,
case when @orderBy = 4 and @ascDesc = 'desc' then item_desc end desc,
case when @orderBy = 5 and @ascDesc = 'asc' then wh.[desc] end asc,
case when @orderBy = 5 and @ascDesc = 'desc' then wh.[desc] end desc,
case when @orderBy = 6 and @ascDesc = 'asc' then wh_lc.[desc] end asc,
case when @orderBy = 6 and @ascDesc = 'desc' then wh_lc.[desc] end desc,
case when @orderBy = 7 and @ascDesc = 'asc' then isnull(la.val,'') end asc,
case when @orderBy = 7 and @ascDesc = 'desc' then isnull(la.val,'') end desc,
case when @orderBy = 8 and @ascDesc = 'asc' then isnull(lu.val,'') end asc, 
case when @orderBy = 8 and @ascDesc = 'desc' then isnull(lu.val,'') end desc,
case when @orderBy = 9 and @ascDesc = 'asc' then isnull(pz.val,'') end asc, 
case when @orderBy = 9 and @ascDesc = 'desc' then isnull(pz.val,'') end desc,
case when @orderBy = 10 and @ascDesc = 'asc' then isnull(de.val,'') end asc, 
case when @orderBy = 10 and @ascDesc = 'desc' then isnull(de.val,'') end desc,
case when @orderBy = 11 and @ascDesc = 'asc' then isnull(di.val,'') end asc, 
case when @orderBy = 11 and @ascDesc = 'desc' then isnull(di.val,'') end desc,
case when @orderBy = 12 and @ascDesc = 'asc' then (select count(*) from dbo.cutting_order_row c where c.IDcompany= stock.IDcompany and c.IDlot = lot.IDlot) end asc,
case when @orderBy = 12 and @ascDesc = 'desc' then (select count(*) from dbo.cutting_order_row c where c.IDcompany= stock.IDcompany and c.IDlot = lot.IDlot) end desc,
case when @orderBy = 13 and @ascDesc = 'asc' then qty_stock end asc,
case when @orderBy = 13 and @ascDesc = 'desc' then qty_stock end desc,
case when @orderBy = 14 and @ascDesc = 'asc' then um end asc,
case when @orderBy = 14 and @ascDesc = 'desc' then um end desc,
case when @orderBy = 15 and @ascDesc = 'asc' then date_lot end asc,
case when @orderBy = 15 and @ascDesc = 'desc' then date_lot end desc,
case when @orderBy = 16 and @ascDesc = 'asc' then stepRoll end asc,
case when @orderBy = 16 and @ascDesc = 'desc' then stepRoll end desc,
case when @orderBy = 17 and @ascDesc = 'asc' then ord_rif end asc, 
case when @orderBy = 17 and @ascDesc = 'desc' then ord_rif end desc
offset @offset rows fetch next @fetchNext rows only
GO
/****** Object:  UserDefinedFunction [dbo].[0000_parView_StockViewer]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[0000_parView_StockViewer] (
/* 2020 02 07, 
 funzione per l'estrazione dati della pagina stock viewer.
 Questa funzione estrae paginando l'estrazione, per lanciare la funzione:
select * from [dbo].[parView_StockViewer](845,					
										 '','','','','','','',								    --Filtri su testo solo "like"
										 '','','','',										    --Filtri testo con like oppure con l'=    
										 '100','<','','','','','','','','','','','','','','',   --Filtri con i valori numerici 
										 1,'asc',0,1000)									     --Parametri pagining tabella
 2020 04 03,
 Abbiamo escluso la vista (vw_stock_viewer) all'interno di questa function per 
 questioni di performances inserendo direttamente la query, la vecchia view
 rimane utilizzata per l'estrazione completa dello stock su excel con la 
 pagina web report_service_export_stock_all.php (se vengono effettuate modifiche
 all'interno di questa function è necessario valutare la modifica anche 
 della vecchia vista)
*/

@IDcompany int,
/*Filtri su testo solo "like" */
@whdesc nvarchar(100), 
@um nvarchar(3),
@IDlot nvarchar(20),
@IDlot_origine nvarchar(20),
@stepRoll nvarchar(3),
@eur1 nvarchar(3),
@ord_rif nvarchar(100),

/* Filtri testo con like oppure con l'=    */
@item nvarchar(47),
@itemC nvarchar(2),
@itemDesc nvarchar(47),
@itemDescC nvarchar(2),
@lcdesc nvarchar(100),
@lcdescC nvarchar(2),
/* Filtri con i valori numerici */
@la nvarchar(50),
@laC nvarchar(2),
@lu nvarchar(50),
@luC nvarchar(2),
@pz nvarchar(50),
@pzC nvarchar(2),
@de nvarchar(50),
@deC nvarchar(2),
@di nvarchar(50),
@diC nvarchar(2),
@ncut nvarchar(50),
@ncutC nvarchar(2),
@qty nvarchar(50),
@qtyC nvarchar(2),
@lotDate nvarchar(50),
@lotDateC nvarchar(2),
/*Parametri pagining tabella*/
@orderBy int, @ascDesc nvarchar(5), @offset int, @fetchNext int
)

RETURNS TABLE
AS
RETURN
select lot.IDlot, IDlot_origine, item.item, item.item_desc, wh.[desc] as whdesc, wh_lc.[desc] as lcdesc,
isnull(LA,'') as LA, isnull(LU,'') as LU, isnull(PZ,'') as PZ,  isnull(DE,'') as DE, isnull(DI,'') as DI, 
isnull(cuts.Ncut,0) as cutNum, qty_stock, item.um,  
substring(convert(varchar, lot.date_lot, 20),1,10) as date_lot, 
case when stepRoll = 0 then 'No' else 'Yes' end as stepRoll,
lot.ord_rif, stock.IDwarehouse, stock.IDlocation, lot.note
,IDinventory, IDstock,
comp.NumComp
,case when lot.eur1 = 0 then 'No' else 'Yes' end as eur1
from dbo.stock 
inner join lot on lot.IDcompany = stock.IDcompany and lot.IDlot = stock.IDlot 
inner join item on item.IDitem = lot.IDitem 
inner join warehouse wh on wh.IDcompany = stock.IDcompany and stock.IDwarehouse = wh.IDwarehouse 
inner join warehouse_location wh_lc on wh_lc.IDcompany = stock.IDcompany and stock.IDlocation = wh_lc.IDlocation
/* Non tutti gli articoli hanno tutte le dimensioni (2020-04-16 aggiunta pivot sulle dimensioni lotto) */
left outer join dbo.vw_lotDimensionsPivot dim on dim.IDcompany = stock.IDcompany and dim.IDlot = stock.IDlot
/* Viste di appoggio (in precedenza erano subquery, modificate dopo verifica execution plan) */
left outer join dbo.vw_cuts_on_cutting_order cuts on cuts.IDcompany = stock.IDcompany and cuts.IDlot = lot.IDlot
left outer join dbo.vw_comp_on_production_order comp on comp.IDcompany = comp.IDcompany and comp.IDlot = stock.IDlot
where stock.IDcompany = @IDcompany
/* Filtri testo con like oppure con l'=    */ 
and dbo.checkValueByCondition(@itemC,'char', item, @item) = 1
and dbo.checkValueByCondition(@itemDescC,'char', item_desc, @itemDesc) = 1 
and dbo.checkValueByCondition(@lcdescC,'char', wh_lc.[desc],@lcdesc) = 1
/* Filtri con >, >= ecc .. ci appoggiamo alla funzione per verificare la codizione,
qui non era possibile usare il parametro come condizione(>,<...) */
and dbo.checkValueByCondition(@laC,'float', isnull(LA,''), @la) = 1   
and dbo.checkValueByCondition(@luC,'float', isnull(LU,''), @lu) = 1  
and dbo.checkValueByCondition(@pzC,'float', isnull(PZ,''), @pz) = 1
and dbo.checkValueByCondition(@deC,'float', isnull(DE,''), @de) = 1
and dbo.checkValueByCondition(@diC,'float', isnull(DI,''), @di) = 1
and dbo.checkValueByCondition(@ncutC,'float', isnull(cuts.Ncut,0), @ncut) = 1
and dbo.checkValueByCondition(@qtyC,'float', qty_stock, @qty) = 1    
and dbo.checkValueByCondition(@lotDateC,'date', date_lot, @lotDate) = 1
/* filtri su testi, eseguiti sempre stile like (senza possibilità di scegliere = o *)*/
and dbo.checkValueByCondition('*','char', wh.[desc],@whdesc) = 1
and dbo.checkValueByCondition('*','char', um, @um) = 1
and dbo.checkValueByCondition('*','char', stock.IDlot, @IDlot) = 1
and dbo.checkValueByCondition('*','char', IDlot_origine, @IDlot_origine) = 1
and dbo.checkValueByCondition('*','char', ord_rif, @ord_rif) = 1
/*Campi yes no*/
and (@stepRoll				= '' or CHARINDEX(lower(@stepRoll), (case when lot.stepRoll = 0 then 'no' else 'yes' end)) > 0) 
and (@eur1				    = '' or CHARINDEX(lower(@eur1), (case when lot.eur1 = 0 then 'no' else 'yes' end)) > 0)
/*2020 04 12, adeguamento alla funzione anche qui ...
and (@whdesc				= '' or CHARINDEX(replace(lower(@whdesc), ' ',''), replace(lower(wh.[desc]), ' ','')) > 0) 
and (ltrim(rtrim(@lcdesc))	= '' or CHARINDEX(replace(lower(@lcdesc), ' ',''), replace(lower(wh_lc.[desc]), ' ','')) > 0 )  
and (@um					= '' or CHARINDEX(replace(lower(@um), ' ',''), replace(lower(um), ' ','')) > 0) 
and (@IDlot					= '' or CHARINDEX(replace(lower(@IDlot), ' ',''), replace(lower(stock.IDlot), ' ','')) > 0)  
and (@IDlot_origine			= '' or CHARINDEX(replace(lower(@IDlot_origine), ' ',''), replace(lower(IDlot_origine), ' ','')) > 0) 
and (@stepRoll				= '' or CHARINDEX(lower(@stepRoll), (case when lot.stepRoll = 0 then 'no' else 'yes' end)) > 0) 
and (@eur1				    = '' or CHARINDEX(lower(@eur1), (case when lot.eur1 = 0 then 'no' else 'yes' end)) > 0)
and (@ord_rif				= '' or CHARINDEX(@ord_rif, ord_rif) > 0) */
order by  
/* Le function non accettano variabile numeriche come parametro di order by,
gestiamo la problematica con l'utilizzo dei case */
case when @orderBy = 1 and @ascDesc = 'asc' then stock.IDlot end asc,
case when @orderBy = 1 and @ascDesc = 'desc' then stock.IDlot end desc,
case when @orderBy = 2 and @ascDesc = 'asc' then IDlot_origine end asc,
case when @orderBy = 2 and @ascDesc = 'desc' then IDlot_origine end desc,
case when @orderBy = 3 and @ascDesc = 'asc' then item end asc,
case when @orderBy = 3 and @ascDesc = 'desc' then item end desc,
case when @orderBy = 4 and @ascDesc = 'asc' then item_desc  end asc,
case when @orderBy = 4 and @ascDesc = 'desc' then item_desc end desc,
case when @orderBy = 5 and @ascDesc = 'asc' then wh.[desc] end asc,
case when @orderBy = 5 and @ascDesc = 'desc' then wh.[desc] end desc,
case when @orderBy = 6 and @ascDesc = 'asc' then wh_lc.[desc] end asc,
case when @orderBy = 6 and @ascDesc = 'desc' then wh_lc.[desc] end desc,
case when @orderBy = 7 and @ascDesc = 'asc' then isnull(LA,'') end asc,
case when @orderBy = 7 and @ascDesc = 'desc' then isnull(LA,'') end desc,
case when @orderBy = 8 and @ascDesc = 'asc' then isnull(LU,'') end asc, 
case when @orderBy = 8 and @ascDesc = 'desc' then isnull(LU,'') end desc,
case when @orderBy = 9 and @ascDesc = 'asc' then isnull(PZ,'') end asc, 
case when @orderBy = 9 and @ascDesc = 'desc' then isnull(PZ,'') end desc,
case when @orderBy = 10 and @ascDesc = 'asc' then isnull(DE,'') end asc, 
case when @orderBy = 10 and @ascDesc = 'desc' then isnull(DE,'') end desc,
case when @orderBy = 11 and @ascDesc = 'asc' then isnull(DI,'') end asc, 
case when @orderBy = 11 and @ascDesc = 'desc' then isnull(DI,'') end desc,
case when @orderBy = 12 and @ascDesc = 'asc' then (isnull(cuts.Ncut,0)) end asc,
case when @orderBy = 12 and @ascDesc = 'desc' then (isnull(cuts.Ncut,0)) end desc,
case when @orderBy = 13 and @ascDesc = 'asc' then qty_stock end asc,
case when @orderBy = 13 and @ascDesc = 'desc' then qty_stock end desc,
case when @orderBy = 14 and @ascDesc = 'asc' then um end asc,
case when @orderBy = 14 and @ascDesc = 'desc' then um end desc,
case when @orderBy = 15 and @ascDesc = 'asc' then date_lot end asc,
case when @orderBy = 15 and @ascDesc = 'desc' then date_lot end desc,
case when @orderBy = 16 and @ascDesc = 'asc' then stepRoll end asc,
case when @orderBy = 16 and @ascDesc = 'desc' then stepRoll end desc,
case when @orderBy = 17 and @ascDesc = 'asc' then ord_rif end asc, 
case when @orderBy = 17 and @ascDesc = 'desc' then ord_rif end desc
offset @offset rows fetch next @fetchNext rows only
GO
/****** Object:  View [dbo].[vw_LN_InvoiceLots]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE view [dbo].[vw_LN_InvoiceLots] as
select distinct 
tFatt.t_itbp, tFatt.t_tran + cast(tFatt.t_idoc as nvarchar(max)) as invNum, sped.t_item, 
case when ltrim(rtrim(i.t_dscb)) = '' then ltrim(rtrim(sped.t_item)) else  ltrim(rtrim(i.t_dscb)) end as item_std,
sped.t_clot
FROM [ERP-DB02\ERPLN].[erplndb].dbo.tcisli305815 tFatt
/* Righe fattura */
  inner join [ERP-DB02\ERPLN].[erplndb].dbo.tcisli310815 	lfatt
	on lfatt.t_idoc = tFatt.t_idoc
	and lfatt.t_tran = tFatt.t_tran
 /* Spedizioni */
   inner join [ERP-DB02\ERPLN].[erplndb].dbo.twhinh431815 sped 
   on sped.t_shpm = lfatt.t_shpm
    and sped.t_pono =lfatt.t_shln
	and sped.t_item = lfatt.t_item
inner join [ERP-DB02\ERPLN].[erplndb].dbo.ttcibd001815 i on i.t_item = sped.t_item
 where tFatt.t_itbp COLLATE DATABASE_DEFAULT in (select LN_bpid_code from [dbo].[company])
 and tFatt.t_idat > DateAdd(MM, -3, getutcdate()) /* Leggiamo le fatture fino a 3 mesi fa */
GO
/****** Object:  View [dbo].[vw_LN_shipment_lots]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE view [dbo].[vw_LN_shipment_lots] as
	/* Pre filtriamo i lotti che ci interessano */
	/* 2020 01 13, tolta la distinct e aggiunto il group by per estrarre la qty totale delle sped, che poi
	andiamo a moltiplicare per la qty contenuta nei configurati */
	select  LN_bpid_code, 
	sped.t_item,
	case when ltrim(rtrim(i.t_dscb)) = '' then ltrim(rtrim(sped.t_item)) else  ltrim(rtrim(i.t_dscb)) end as item_std,
	sped.t_clot, t_cpva, sum(t_qshp) as t_qshp,
	case when l.t_eur1_c = 1 then 1
		 when l.t_eur1_c = 2 then 0
	end as eur1 --2020 04 02, aggiunto info euro 1 (convertimo il valore al tipo "bit")
	from [ERP-DB02\ERPLN].[erplndb].dbo.twhinh431815 sped
	/* Solo gli articoli non frazionabili, gli altri non abbiamo la certezza delle dimensioni o del valore */
	inner join [ERP-DB02\ERPLN].[erplndb].dbo.ttcibd001815 i on i.t_item = sped.t_item
	/* cartiamo i lotti sui cui è stato messo il flag consenti eccezionalmente ... */
	inner join [ERP-DB02\ERPLN].[erplndb].dbo.twhltc100815 l on l.t_clot = sped.t_clot 
	/* Solo spedizioni verso filiali, il codice bp di ln è dentro la tabella company */
	inner join [ERP-DB02\ERPLN].[erplndb].dbo.twhinh430815 hsped on sped.t_shpm = hsped.t_shpm	
	inner join dbo.company c on [LN_bpid_code] COLLATE DATABASE_DEFAULT = hsped.t_ofbp
	where t_worg = 1  and (IsNull(sped.t_clot, '') <> '')
	-- and i.t_slot_c = 2 /* Problema lotto ML2 che è a m2 ma frazionabile */
	and l.t_cflt_c = 2
	and i.t_ctyp not in /*('CA', 'IG', 'UC', 'UV', 'CO','AC')*/ ('CA', 'UC', 'UV')
	group by LN_bpid_code, sped.t_item, t_dscb, sped.t_clot, t_cpva, l.t_eur1_c
GO
/****** Object:  UserDefinedFunction [dbo].[parView_StockViewer_NOpivot_20200416]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_StockViewer_NOpivot_20200416] (
/* 2020 02 07, 
 funzione per l'estrazione dati della pagina stock viewer.
 Questa funzione estrae paginando l'estrazione, per lanciare la funzione:
select * from [dbo].[parView_StockViewer](845,					
										 '','','','','','','',								    --Filtri su testo solo "like"
										 '','','','',										    --Filtri testo con like oppure con l'=    
										 '100','<','','','','','','','','','','','','','','',   --Filtri con i valori numerici 
										 1,'asc',0,1000)									     --Parametri pagining tabella
 2020 04 03,
 Abbiamo escluso la vista (vw_stock_viewer) all'interno di questa function per 
 questioni di performances inserendo direttamente la query, la vecchia view
 rimane utilizzata per l'estrazione completa dello stock su excel con la 
 pagina web report_service_export_stock_all.php (se vengono effettuate modifiche
 all'interno di questa function è necessario valutare la modifica anche 
 della vecchia vista)
*/

@IDcompany int,
/*Filtri su testo solo "like" */
@whdesc nvarchar(100), 
@um nvarchar(3),
@IDlot nvarchar(20),
@IDlot_origine nvarchar(20),
@stepRoll nvarchar(3),
@eur1 nvarchar(3),
@ord_rif nvarchar(100),

/* Filtri testo con like oppure con l'=    */
@item nvarchar(47),
@itemC nvarchar(2),
@itemDesc nvarchar(47),
@itemDescC nvarchar(2),
@lcdesc nvarchar(100),
@lcdescC nvarchar(2),
/* Filtri con i valori numerici */
@la nvarchar(50),
@laC nvarchar(2),
@lu nvarchar(50),
@luC nvarchar(2),
@pz nvarchar(50),
@pzC nvarchar(2),
@de nvarchar(50),
@deC nvarchar(2),
@di nvarchar(50),
@diC nvarchar(2),
@ncut nvarchar(50),
@ncutC nvarchar(2),
@qty nvarchar(50),
@qtyC nvarchar(2),
@lotDate nvarchar(50),
@lotDateC nvarchar(2),
/*Parametri pagining tabella*/
@orderBy int, @ascDesc nvarchar(5), @offset int, @fetchNext int
)

RETURNS TABLE
AS
RETURN
select lot.IDlot, IDlot_origine, item.item, item.item_desc, wh.[desc] as whdesc, wh_lc.[desc] as lcdesc,
isnull(la.val,'') as LA, isnull(lu.val,'') as LU, isnull(pz.val,'') as PZ,  isnull(de.val,'') as DE, isnull(di.val,'') as DI, 
isnull(cuts.Ncut,0) as cutNum, qty_stock, item.um,  
substring(convert(varchar, lot.date_lot, 20),1,10) as date_lot, 
case when stepRoll = 0 then 'No' else 'Yes' end as stepRoll,
lot.ord_rif, stock.IDwarehouse, stock.IDlocation, lot.note
,IDinventory, IDstock,
comp.NumComp
,case when lot.eur1 = 0 then 'No' else 'Yes' end as eur1
from dbo.stock 
inner join lot on lot.IDcompany = stock.IDcompany and lot.IDlot = stock.IDlot 
inner join item on item.IDitem = lot.IDitem 
inner join warehouse wh on wh.IDcompany = stock.IDcompany and stock.IDwarehouse = wh.IDwarehouse 
inner join warehouse_location wh_lc on wh_lc.IDcompany = stock.IDcompany and stock.IDlocation = wh_lc.IDlocation
/* Non tutti gli articoli hanno tutte le dimensioni */
left outer join dbo.lot_dimension la on la.IDcompany = stock.IDcompany and la.IDlot = stock.IDlot and la.IDcar = 'LA' 
left outer join dbo.lot_dimension lu on lu.IDcompany = stock.IDcompany and lu.IDlot = stock.IDlot and lu.IDcar = 'LU' 
left outer join dbo.lot_dimension pz on pz.IDcompany = stock.IDcompany and pz.IDlot = stock.IDlot and pz.IDcar = 'PZ' 
left outer join dbo.lot_dimension de on de.IDcompany = stock.IDcompany and de.IDlot = stock.IDlot and de.IDcar = 'DE' 
left outer join dbo.lot_dimension di on di.IDcompany = stock.IDcompany and di.IDlot = stock.IDlot and di.IDcar = 'DI' 
/* Viste di appoggio (in precedenza erano subquery, modificate dopo verifica execution plan) */
left outer join dbo.vw_cuts_on_cutting_order cuts on cuts.IDcompany = stock.IDcompany and cuts.IDlot = lot.IDlot
left outer join dbo.vw_comp_on_production_order comp on comp.IDcompany = comp.IDcompany and comp.IDlot = stock.IDlot
where stock.IDcompany = @IDcompany
/* Filtri testo con like oppure con l'=    */ 
and dbo.checkValueByCondition(@itemC,'char', item, @item) = 1
and dbo.checkValueByCondition(@itemDescC,'char', item_desc, @itemDesc) = 1 
and dbo.checkValueByCondition(@lcdescC,'char', wh_lc.[desc],@lcdesc) = 1
/* Filtri con >, >= ecc .. ci appoggiamo alla funzione per verificare la codizione,
qui non era possibile usare il parametro come condizione(>,<...) */
and dbo.checkValueByCondition(@laC,'float', isnull(la.val,''), @la) = 1   
and dbo.checkValueByCondition(@luC,'float', isnull(lu.val,''), @lu) = 1  
and dbo.checkValueByCondition(@pzC,'float', isnull(pz.val,''), @pz) = 1
and dbo.checkValueByCondition(@deC,'float', isnull(de.val,''), @de) = 1
and dbo.checkValueByCondition(@diC,'float', isnull(di.val,''), @di) = 1
and dbo.checkValueByCondition(@ncutC,'float', isnull(cuts.Ncut,0), @ncut) = 1
and dbo.checkValueByCondition(@qtyC,'float', qty_stock, @qty) = 1    
and dbo.checkValueByCondition(@lotDateC,'date', date_lot, @lotDate) = 1
/* filtri su testi, eseguiti sempre stile like (senza possibilità di scegliere = o *)*/
and dbo.checkValueByCondition('*','char', wh.[desc],@whdesc) = 1
and dbo.checkValueByCondition('*','char', um, @um) = 1
and dbo.checkValueByCondition('*','char', stock.IDlot, @IDlot) = 1
and dbo.checkValueByCondition('*','char', IDlot_origine, @IDlot_origine) = 1
and dbo.checkValueByCondition('*','char', ord_rif, @ord_rif) = 1
/*Campi yes no*/
and (@stepRoll				= '' or CHARINDEX(lower(@stepRoll), (case when lot.stepRoll = 0 then 'no' else 'yes' end)) > 0) 
and (@eur1				    = '' or CHARINDEX(lower(@eur1), (case when lot.eur1 = 0 then 'no' else 'yes' end)) > 0)
/*2020 04 12, adeguamento alla funzione anche qui ...
and (@whdesc				= '' or CHARINDEX(replace(lower(@whdesc), ' ',''), replace(lower(wh.[desc]), ' ','')) > 0) 
and (ltrim(rtrim(@lcdesc))	= '' or CHARINDEX(replace(lower(@lcdesc), ' ',''), replace(lower(wh_lc.[desc]), ' ','')) > 0 )  
and (@um					= '' or CHARINDEX(replace(lower(@um), ' ',''), replace(lower(um), ' ','')) > 0) 
and (@IDlot					= '' or CHARINDEX(replace(lower(@IDlot), ' ',''), replace(lower(stock.IDlot), ' ','')) > 0)  
and (@IDlot_origine			= '' or CHARINDEX(replace(lower(@IDlot_origine), ' ',''), replace(lower(IDlot_origine), ' ','')) > 0) 
and (@stepRoll				= '' or CHARINDEX(lower(@stepRoll), (case when lot.stepRoll = 0 then 'no' else 'yes' end)) > 0) 
and (@eur1				    = '' or CHARINDEX(lower(@eur1), (case when lot.eur1 = 0 then 'no' else 'yes' end)) > 0)
and (@ord_rif				= '' or CHARINDEX(@ord_rif, ord_rif) > 0) */
order by  
/* Le function non accettano variabile numeriche come parametro di order by,
gestiamo la problematica con l'utilizzo dei case */
case when @orderBy = 1 and @ascDesc = 'asc' then stock.IDlot end asc,
case when @orderBy = 1 and @ascDesc = 'desc' then stock.IDlot end desc,
case when @orderBy = 2 and @ascDesc = 'asc' then IDlot_origine end asc,
case when @orderBy = 2 and @ascDesc = 'desc' then IDlot_origine end desc,
case when @orderBy = 3 and @ascDesc = 'asc' then item end asc,
case when @orderBy = 3 and @ascDesc = 'desc' then item end desc,
case when @orderBy = 4 and @ascDesc = 'asc' then item_desc  end asc,
case when @orderBy = 4 and @ascDesc = 'desc' then item_desc end desc,
case when @orderBy = 5 and @ascDesc = 'asc' then wh.[desc] end asc,
case when @orderBy = 5 and @ascDesc = 'desc' then wh.[desc] end desc,
case when @orderBy = 6 and @ascDesc = 'asc' then wh_lc.[desc] end asc,
case when @orderBy = 6 and @ascDesc = 'desc' then wh_lc.[desc] end desc,
case when @orderBy = 7 and @ascDesc = 'asc' then isnull(la.val,'') end asc,
case when @orderBy = 7 and @ascDesc = 'desc' then isnull(la.val,'') end desc,
case when @orderBy = 8 and @ascDesc = 'asc' then isnull(lu.val,'') end asc, 
case when @orderBy = 8 and @ascDesc = 'desc' then isnull(lu.val,'') end desc,
case when @orderBy = 9 and @ascDesc = 'asc' then isnull(pz.val,'') end asc, 
case when @orderBy = 9 and @ascDesc = 'desc' then isnull(pz.val,'') end desc,
case when @orderBy = 10 and @ascDesc = 'asc' then isnull(de.val,'') end asc, 
case when @orderBy = 10 and @ascDesc = 'desc' then isnull(de.val,'') end desc,
case when @orderBy = 11 and @ascDesc = 'asc' then isnull(di.val,'') end asc, 
case when @orderBy = 11 and @ascDesc = 'desc' then isnull(di.val,'') end desc,
case when @orderBy = 12 and @ascDesc = 'asc' then (isnull(cuts.Ncut,0)) end asc,
case when @orderBy = 12 and @ascDesc = 'desc' then (isnull(cuts.Ncut,0)) end desc,
case when @orderBy = 13 and @ascDesc = 'asc' then qty_stock end asc,
case when @orderBy = 13 and @ascDesc = 'desc' then qty_stock end desc,
case when @orderBy = 14 and @ascDesc = 'asc' then um end asc,
case when @orderBy = 14 and @ascDesc = 'desc' then um end desc,
case when @orderBy = 15 and @ascDesc = 'asc' then date_lot end asc,
case when @orderBy = 15 and @ascDesc = 'desc' then date_lot end desc,
case when @orderBy = 16 and @ascDesc = 'asc' then stepRoll end asc,
case when @orderBy = 16 and @ascDesc = 'desc' then stepRoll end desc,
case when @orderBy = 17 and @ascDesc = 'asc' then ord_rif end asc, 
case when @orderBy = 17 and @ascDesc = 'desc' then ord_rif end desc
offset @offset rows fetch next @fetchNext rows only
GO
/****** Object:  View [dbo].[vw_LN_shipment_lots_art_num]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE view [dbo].[vw_LN_shipment_lots_art_num] as
	/* Pre filtriamo i lotti che ci interessano */
	select DISTINCT LN_bpid_code, 
	sped.t_item,
	case when ltrim(rtrim(i.t_dscb)) = '' then ltrim(rtrim(sped.t_item)) else  ltrim(rtrim(i.t_dscb)) end as item_std,
	sped.t_clot, sped.t_qpic, 
	case when l.t_eur1_c = 1 then 1
		 when l.t_eur1_c = 2 then 0
	end as eur1 --2020 04 02, aggiunto info euro 1 (convertimo il valore al tipo "bit")
	from [ERP-DB02\ERPLN].[erplndb].dbo.twhinh431815 sped
	/* Solo gli articoli non frazionabili, gli altri non abbiamo la certezza delle dimensioni o del valore */
	inner join [ERP-DB02\ERPLN].[erplndb].dbo.ttcibd001815 i on i.t_item = sped.t_item
	/* Scartiamo i lotti sui cui è stato messo il flag consenti eccezionalmente ... */
	inner join [ERP-DB02\ERPLN].[erplndb].dbo.twhltc100815 l on l.t_clot = sped.t_clot 
	/* Solo spedizioni verso filiali, il codice bp di ln è dentro la tabella company */
	inner join [ERP-DB02\ERPLN].[erplndb].dbo.twhinh430815 hsped on sped.t_shpm = hsped.t_shpm	
	inner join dbo.company c on [LN_bpid_code] COLLATE DATABASE_DEFAULT = hsped.t_ofbp
	where t_worg = 1  and (IsNull(sped.t_clot, '') <> '')
	/* 2019 01 2020 per gli articoli a numero prendiamo anche quelli frazionabili */
	--and i.t_slot_c = 2     	
	--and l.t_cflt_c = 2
	/* Gli 'ML' non vanno qui perchè sono gestiti a lotto e a m2, vanno nella  vw_LN_shipment_lots !! */
	and i.t_ctyp in ('AC', 'IG', 'CO','AT')
GO
/****** Object:  Table [dbo].[devaluation_history]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[devaluation_history](
	[IDdevaluation] [nvarchar](100) NOT NULL,
	[IDcompany] [int] NOT NULL,
	[date_dev] [datetime] NOT NULL,
	[username] [nvarchar](35) NOT NULL,
 CONSTRAINT [devaluation_history_PK] PRIMARY KEY CLUSTERED 
(
	[IDdevaluation] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  UserDefinedFunction [dbo].[parView_devaluetedLots]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_devaluetedLots] (@IDcompany int, @data_f datetime, @data_t datetime)
RETURNS TABLE AS RETURN
SELECT dv.IDdevaluation
      ,dv.IDcompany
      ,date_dev
      ,dv.username as dev_user
	  ,lv.UnitValue as devaluated_value
	  ,l.devaluation as devaluation_type
	  ,max_v.MaxUnitValue
	  ,last_v.UnitValue as current_val
	  ,lv.IDlot
	  ,item
	  ,item_desc
  FROM dbo.devaluation_history dv
  inner join dbo.lot_value lv on lv.IDcompany = dv.IDcompany and dv.IDdevaluation = lv.IDdevaluation
  inner join dbo.lot l on l.IDcompany = dv.IDcompany and lv.IDlot = l.IDlot
  inner join dbo.item i on  l.IDitem = i.IDitem
  inner join dbo.vw_lot_max_value max_v on max_v.IDcompany = dv.IDcompany and max_v.IDlot = lv.IDlot
  inner join dbo.vw_lot_last_value last_v on last_v.IDcompany = dv.IDcompany and last_v.IDlot = lv.IDlot
  where dv.IDcompany = @IDcompany and dv.date_dev between @data_f and @data_t
GO
/****** Object:  Table [dbo].[users]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[users](
	[IDcompany] [int] NOT NULL,
	[username] [nvarchar](35) NOT NULL,
	[language] [nvarchar](2) NOT NULL,
	[IDwarehouseUserDef] [nvarchar](100) NULL,
	[clientTimezoneDB] [nvarchar](100) NULL,
	[decimal_symb] [nvarchar](1) NOT NULL,
	[list_separator] [nvarchar](1) NOT NULL,
	[id] [bigint] IDENTITY(1,1) NOT NULL,
 CONSTRAINT [users_UN] UNIQUE NONCLUSTERED 
(
	[username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  UserDefinedFunction [dbo].[parView_indexLogin]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_indexLogin] (@username nvarchar(35))
RETURNS TABLE
AS
RETURN
SELECT u.username, u.IDcompany, c.[desc], IDgroup, clientTimezoneDB, decimal_symb, list_separator 
FROM dbo.users u
inner join dbo.company c on u.IDcompany = c.IDcompany 
where username = @username
GO
/****** Object:  Table [dbo].[zETL_LN_sales_order_open]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[zETL_LN_sales_order_open](
	[IDcompany] [int] NULL,
	[t_ofbp] [nvarchar](9) NOT NULL,
	[t_orno] [nvarchar](9) NOT NULL,
	[t_sqnb] [int] NULL,
	[t_pono] [int] NULL,
	[t_item] [nvarchar](47) NOT NULL,
	[item_std] [nvarchar](47) NOT NULL,
	[cfg] [bit] NOT NULL,
	[UM_CSM] [nvarchar](3) NOT NULL,
	[UM_LN] [nvarchar](3) NOT NULL,
	[t_qoor] [float] NULL,
	[LA] [float] NULL,
	[LU] [float] NULL,
	[PZ] [float] NULL,
	[DE] [float] NULL,
	[DI] [float] NULL,
	[boxed_qty_UM_LN] [float] NULL,
	[shipping_qty_UM_LN] [float] NULL,
	[delivered_qty_UM_LN] [float] NULL,
	[leftovery_UM_LN] [float] NULL,
	[ord_bp_row] [nvarchar](120) NOT NULL,
	[t_prdt_c] [datetime] NULL,
	[t_ddta] [datetime] NULL,
	[record_date] [datetime] NULL
) ON [PRIMARY]
GO
/****** Object:  UserDefinedFunction [dbo].[1111parView_LN_sales_order_open]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[1111parView_LN_sales_order_open] (
	@IDcompany int,
	/*Filtri su testo solo "like" */
	@Orde nvarchar(47), 
	@Orrf nvarchar(100), 	
	@Item nvarchar(100),
	@Dins nvarchar(100),
	@Dpln nvarchar(100)
	)
RETURNS TABLE
AS
RETURN
/*
	2023-01-31, vista che si appoggia alla tabella fisica popolata dalla sp_zLN_lndb_sync,
	qui maneggiamo i valori per esporre i dati sulla pagina web
*/
SELECT IDcompany,[t_orno]     
      ,[t_pono]	  
      ,[item_std]
      ,case when [cfg] = 0 then 'No' else 'Yes' end as cfg
      ,[UM_CSM]
      ,[UM_LN]
      ,[t_qoor]
      ,[LA]
      ,[LU]
      ,[PZ]
      ,[DE]
      ,[DI]
      ,[boxed_qty_UM_LN]
	  ,[shipping_qty_UM_LN]
      ,[delivered_qty_UM_LN]
      ,[leftovery_UM_LN]	
	  ,case 
	   when UM_LN = UM_CSM then [shipping_qty_UM_LN]
	   when UM_LN = 'NUM'  and UM_CSM = 'N'  then [shipping_qty_UM_LN] 
	   when UM_LN = 'N'  and UM_CSM = 'm2'  then [shipping_qty_UM_LN]*LA*LU/1000000 --Configurati
	   when UM_LN = 'm'  and UM_CSM = 'm'   then [shipping_qty_UM_LN]				--Configurati
	   end [shipping_qty_UM_CSM]
	  ,case 
	   when UM_LN = UM_CSM then [boxed_qty_UM_LN]
	   when UM_LN = 'NUM'  and UM_CSM = 'N'  then [boxed_qty_UM_LN] 
	   when UM_LN = 'N'  and UM_CSM = 'm2'  then [boxed_qty_UM_LN]*LA*LU/1000000 --Configurati
	   when UM_LN = 'm'  and UM_CSM = 'm'   then [boxed_qty_UM_LN]				 --Configurati
	   end [boxed_qty_UM_CSM]
	  ,case 
	   when UM_LN = UM_CSM then [delivered_qty_UM_LN]
	   when UM_LN = 'NUM'  and UM_CSM = 'N'  then [delivered_qty_UM_LN]
	   when UM_LN = 'N'  and UM_CSM = 'm2'  then [delivered_qty_UM_LN]*LA*LU/1000000 --Configurati
	   when UM_LN = 'm'  and UM_CSM = 'm'   then [delivered_qty_UM_LN]				 --Configurati
	   end [delivered_qty_UM_CSM]  
	  ,case 
	   when UM_LN = UM_CSM then [leftovery_UM_LN]
	   when UM_LN = 'NUM'  and UM_CSM = 'N'  then [leftovery_UM_LN]
	   when UM_LN = 'N'  and UM_CSM = 'm2'  then [leftovery_UM_LN]*LA*LU/1000000 --Configurati
	   when UM_LN = 'm'  and UM_CSM = 'm'   then [leftovery_UM_LN]				 --Configurati
	   end as leftovery_UM_CSM
      ,[ord_bp_row]
      ,[t_prdt_c]
      ,cast(year([t_ddta]) as varchar(4)) + '-' + cast(month([t_ddta]) as varchar(2)) planned_date
      ,[record_date]
  FROM [dbo].[zETL_LN_sales_order_open] 
  where IDcompany = @IDcompany
  /* filtri su testi, eseguiti sempre stile like (senza possibilità di scegliere = o *)*/
  and dbo.checkValueByCondition('*','char', [t_orno], @Orde) = 1
  and dbo.checkValueByCondition('*','char', [ord_bp_row], @Orrf) = 1
  and dbo.checkValueByCondition('*','char', [item_std], @Item) = 1
  and dbo.checkValueByCondition('*','date', (cast(year([t_prdt_c]) as varchar(4)) + '-' + cast(month([t_prdt_c]) as varchar(2)) + '-' + cast(day([t_prdt_c]) as varchar(2))), @Dins) = 1
  and dbo.checkValueByCondition('*','date', (cast(year([t_ddta]) as varchar(4)) + '-' + cast(month([t_ddta]) as varchar(2))), @Dpln) = 1
GO
/****** Object:  UserDefinedFunction [dbo].[parView_lotDimensionsPivot]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_lotDimensionsPivot] (@IDcompany int)
RETURNS TABLE
AS
RETURN
/*2021-03-19, vista PARAMETRICA utilizzata all'interno 
della vista parametrica dello stock viewer, in quanto 
le multiple jion sulla stessa tabella per recuperare 
tutte le dimensioni risultavano meno performanti. 
In passato usavamo una semplice view, ma si è visto
che con l'ingrandirsi del DB per performances degradavano.
ATTENZIONE, ESTRAIAMO SOLO I LOTTI ATTUALMENTE A MAGAZZINO,
per lo stock viewer non server altro */
SELECT IDlot, [LA],[LU],[PZ],[DE],[DI]
FROM  
(SELECT IDlot, IDcar, val from dbo.lot_dimension where IDcompany = @IDcompany and IDlot in (select IDlot from stock where IDcompany = @IDcompany)) AS t 
PIVOT(
	max(val) 
    FOR IDcar IN ([LA],[LU],[PZ],[DE],[DI])
) AS pivot_table
GO
/****** Object:  UserDefinedFunction [dbo].[1111parView_LotReceivedFromBp]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[1111parView_LotReceivedFromBp] (@IDcompany int, @data_f datetime, @data_t datetime, @IDbp int)
RETURNS TABLE
AS
RETURN
select date_tran, t.IDlot, i.item 
,i.item_desc, [qty], i.um, l.ord_rif	 
,l.note, 
			(select COUNT(*) 
			from dbo.order_production ord 
			inner join dbo.order_production_components ordC on ord.IDord = ordC.IDord and ord.IDcompany = ordC.IDcompany 
			where ord.IDlot = t.IDlot and ord.IDcompany = t.IDcompany
			) as NumComp 
			,case when l.eur1 = 0 then 'No' else 'Yes' end as eur1  /* 2020 04 03 */	
			, d.LA, d.LU, d.PZ, d.DE, d.DI
from transactions t
inner join dbo.lot l on l.IDcompany = t.IDcompany and t.IDlot = l.IDlot 
inner join dbo.item i on i.IDitem = l.IDitem 
inner join dbo.bp b on b.IDcompany = t.IDcompany and b.IDbp = t.IDbp
inner join dbo.vw_lotDimensionsPivot d on d.IDcompany = t.IDcompany and d.IDlot = t.IDlot
where t.IDcompany = @IDcompany and t.IDbp = @IDbp and t.date_tran between @data_f and @data_t and t.IDtrantype = 1
GO
/****** Object:  Table [dbo].[bp_destinations]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[bp_destinations](
	[IDdestination] [nvarchar](100) NOT NULL,
	[IDcompany] [int] NOT NULL,
	[IDbp] [nvarchar](100) NOT NULL,
	[desc] [nvarchar](200) NOT NULL,
 CONSTRAINT [bp_destinations_PK] PRIMARY KEY CLUSTERED 
(
	[IDdestination] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[shipments]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[shipments](
	[IDshipments] [nvarchar](100) NOT NULL,
	[IDcompany] [int] NOT NULL,
	[date_ship] [datetime] NOT NULL,
	[IDlot] [nvarchar](20) NOT NULL,
	[qty] [float] NULL,
	[IDbp] [nvarchar](100) NOT NULL,
	[IDdestination] [nvarchar](100) NULL,
	[delivery_note] [nvarchar](200) NULL
) ON [PRIMARY]
GO
/****** Object:  UserDefinedFunction [dbo].[1111parView_LotShippedBp]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[1111parView_LotShippedBp] (@IDcompany int, @data_f datetime, @data_t datetime, @IDbp int)
RETURNS TABLE
AS
RETURN
SELECT date_ship, s.[IDlot] , i.item 
,i.item_desc, [qty], i.um, dbo.getDimByLot (s.IDcompany, s.IDlot) as dimensions, l.ord_rif	 
,l.note, bpd.[desc] as bpd_desc,
			(select COUNT(*) 
			from dbo.order_production ord 
			inner join dbo.order_production_components ordC on ord.IDord = ordC.IDord and ord.IDcompany = ordC.IDcompany 
			where ord.IDlot = s.IDlot and ord.IDcompany = s.IDcompany
			) as NumComp 
			,case when l.eur1 = 0 then 'No' else 'Yes' end as eur1  /* 2020 04 03 */			  
FROM dbo.shipments s  
inner join dbo.lot l on l.IDcompany = s.IDcompany and s.IDlot = l.IDlot 
inner join dbo.item i on i.IDitem = l.IDitem 
inner join dbo.bp b on b.IDcompany = s.IDcompany and b.IDbp = s.IDbp 
left outer join bp_destinations bpd on bpd.IDdestination = s.IDdestination 
where s.IDcompany = @IDcompany and s.IDbp = @IDbp and date_ship between @data_f and @data_t
GO
/****** Object:  Table [dbo].[transactions_type]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[transactions_type](
	[IDtrantype] [int] NOT NULL,
	[desc] [nvarchar](30) NULL,
 CONSTRAINT [transactions_type_PK] PRIMARY KEY CLUSTERED 
(
	[IDtrantype] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  UserDefinedFunction [dbo].[parView_lotTracking]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_lotTracking] (@IDcompany int, @LotToTrack nvarchar(20))
RETURNS TABLE
AS
RETURN
select substring(convert(varchar, date_tran, 20),1,16) AS data_exec, t.IDlot, 
w.[desc] wdesc, wl.[desc] wldesc, segno, t.qty, t.ord_rif, t.username, dbo.getDimByLot (t.IDcompany, l.IDlot) as dimensions , 
l.IDlot_origine, l.IDlot_padre, l.IDlot_fornitore, i.item, i.item_desc, tt.[desc] as ttdesc, 
bp.[desc] as bpdesc, i.um,
			(select COUNT(*) 
			from dbo.order_production ord 
			inner join dbo.order_production_components ordC on ord.IDord = ordC.IDord and ord.IDcompany = ordC.IDcompany 
			where ord.IDlot = t.IDlot and ord.IDcompany = t.IDcompany
			) as NumComp, 
			(select COUNT(*) 
			from dbo.cutting_order_row cutR			
			where cutR.IDlot = t.IDlot and cutR.IDcompany = t.IDcompany
			) as NumCut,
			isnull(OrdPrd.IDlot,'') as  OrdPrdLot
from transactions t 
inner join transactions_type tt on tt.IDtrantype = t.IDtrantype 
inner join lot l  on l.IDcompany = t.IDcompany and	t.IDlot = l.IDlot 
inner join item i on i.IDitem = l.IDitem 
left outer join bp on bp.IDcompany = t.IDcompany and bp.IDbp = t.IDbp 
left outer join order_production OrdPrd on OrdPrd.IDcompany = t.IDcompany and OrdPrd.IDord = t.IDprodOrd
inner join warehouse w on t.IDwarehouse = w.IDwarehouse and t.IDcompany = w.IDcompany 
inner join warehouse_location wl on t.IDlocation = wl.IDlocation and t.IDcompany = wl.IDcompany 
where t.IDcompany = @IDcompany and t.IDlot in  
(select IDlot from dbo.lot l1 where l1.IDcompany = t.IDcompany and l1.IDlot_origine in 
(select case when IDlot_origine = '' then NULL else IDlot_origine end from dbo.lot l2 where l2.IDcompany = t.IDcompany and l2.IDlot = @LotToTrack ) 
/* la union sotto è nel caso inseriscano il lotto di biella */ union
(select IDlot from dbo.lot l1 where l1.IDcompany = t.IDcompany and l1.IDlot_origine in 
(select case when IDlot_origine = '' then NULL else IDlot_origine end from dbo.lot l2 where l2.IDcompany = t.IDcompany and l2.IDlot_fornitore = @LotToTrack )))
GO
/****** Object:  Table [dbo].[order_merge]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[order_merge](
	[IDcompany] [int] NOT NULL,
	[IDmerge] [nvarchar](100) NOT NULL,
	[executed] [bit] NOT NULL,
	[username] [nvarchar](35) NULL,
	[IDlot_destination] [nvarchar](20) NULL,
	[date_executed] [datetime] NULL,
	[date_creation] [datetime] NULL,
	[date_planned] [datetime] NULL,
 CONSTRAINT [order_merge_PK] PRIMARY KEY CLUSTERED 
(
	[IDmerge] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[order_merge_rows_picking]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[order_merge_rows_picking](
	[IDcompany] [int] NOT NULL,
	[IDmerge] [nvarchar](100) NOT NULL,
	[IDmerge_row_picking_id] [nvarchar](100) NOT NULL,
	[IDStock] [nvarchar](100) NOT NULL,
	[IDlot] [nvarchar](20) NOT NULL,
	[qty] [float] NOT NULL,
	[username] [nvarchar](35) NULL,
	[date_ins] [datetime] NULL,
	[date_picked] [datetime] NULL,
 CONSTRAINT [order_merge_rows_picking_PK] PRIMARY KEY CLUSTERED 
(
	[IDmerge_row_picking_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  UserDefinedFunction [dbo].[1111parView_order_merge_picking]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[1111parView_order_merge_picking] (@IDcompany int, @IDstock bigint, @IDmerge bigint)
RETURNS TABLE
AS RETURN
	/*
	example 
	
	select IDmerge, IDlot, item, item_desc, um, qty, dim, whdesc, lcdesc, stepRoll 
	from [dbo].[parView_order_merge_lots] (845, '34093')
	
    2020 04 07 (fix da material_transfer), modificato le inner con le left, fix problema altri utenti che spostano le giacenza e, l'utente che poi sposta duplicava i record

	Logica:
	Passimo l'idstock che arriva dall URL, verifichiamo se è già dentro un ordine, se lo è leggiamo l'ordine, se no leggiamo i dati
	a partire direttamente dallo stock (select dopo la union) e proponiamo la riga da aggiungere e quindi creare un nuovo ordine.
	Una volta generato l'idordine passiamo anche lui nella funzione, e non utilizziamo piu l'idstock per leggere i dati, ma utilizziamo
	direttamente l'idordine (se l'utente eliminava il lotto che aveva generato l'ordine generava anomalie sull pagina)
	*/
	/* Estraiamo tutto il dettaglio dell'orine se presente, e nel caso di lotti "spostati" mettiamo a video il "not found" */
	select r.IDmerge,r.IDmerge_row_picking_id, isnull(s.IDlot,'Lot not found ... ') as IDlot, i.item, i.item_desc, isnull(i.um,'') as um, r.qty,
	dbo.getDimByLot (@IDcompany, r.IDlot) as dim ,wh.[desc] as whdesc, wh_lc.[desc] as lcdesc, stepRoll, s.IDstock, i.IDitem, s.IDlocation, s.IDwarehouse,
	substring(convert(varchar, date_lot, 20),1,16) AS date_lot, h.executed
	from order_merge_rows_picking r
	inner join order_merge h on h.IDcompany = r.IDcompany and h.IDmerge = r.IDmerge
	inner join lot l on l.IDlot = r.IDlot and l.IDcompany = r.IDcompany
	inner join item i on i.IDitem = l.IDitem 
	left outer join stock s on r.IDstock = s.IDstock
	left outer join warehouse wh on  wh.IDcompany = s.IDcompany and s.IDwarehouse = wh.IDwarehouse 
	left outer join warehouse_location wh_lc on  wh_lc.IDcompany = s.IDcompany and s.IDlocation = wh_lc.IDlocation 
	where r.IDmerge =
				     (case when @IDmerge = 0 then 
											    /*Recupero l'id dell'ordine a partire dallo stock ID, se viene passato l'IDmerge significa */
												(select h.IDmerge 
												 from [order_merge] h
												 inner join [order_merge_rows_picking] r on h.IDcompany = r.IDcompany and h.IDmerge = r.IDmerge
												 where r.IDStock = @IDstock /*34093*/)
											else
												@IDmerge
											end)
	union
	/* LOTTO NUOVO, ORDINE DI CREARE (vedi "not in" in basso) */
	/* Estraiamo il record inserito a partire dallo stock, se esce qui significa che è un lotto "nuovo" appena inserito da URL, è l'utente avrà la possibilità di cliccare su add */
	select 0 as IDmerge,0 as IDmerge_row_id, isnull(s.IDlot,'Lot not found ... ') as IDlot, i.item, i.item_desc, isnull(i.um,'') as um, s.qty_stock,
	dbo.getDimByLot (@IDcompany, s.IDlot) as dim ,wh.[desc] as whdesc, wh_lc.[desc] as lcdesc, stepRoll, s.IDstock, i.IDitem, s.IDlocation, s.IDwarehouse,
	substring(convert(varchar, date_lot, 20),1,16) AS date_lot, 0 as executed
	from stock s
	inner join lot l on l.IDlot = s.IDlot and l.IDcompany = s.IDcompany
	inner join item i on i.IDitem = l.IDitem 
	inner join warehouse wh on  wh.IDcompany = s.IDcompany and s.IDwarehouse = wh.IDwarehouse 
	inner join warehouse_location wh_lc on  wh_lc.IDcompany = s.IDcompany and s.IDlocation = wh_lc.IDlocation 
	where s.IDcompany = @IDcompany  and s.IDstock = @IDstock
	and s.IDstock 
				 not in (select IDstock from [dbo].[order_merge_rows_picking] where IDcompany = @IDcompany)
	and @IDmerge = 0	-- In sostanza disabilitiamo questa query quando è già presente l'ID ordine 
GO
/****** Object:  Table [dbo].[order_merge_rows_return]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[order_merge_rows_return](
	[IDcompany] [int] NOT NULL,
	[IDmerge] [nvarchar](100) NOT NULL,
	[IDmerge_row_return_id] [nvarchar](100) NOT NULL,
	[PZ] [int] NOT NULL,
	[LA] [float] NOT NULL,
	[LU] [float] NOT NULL,
	[IDlot_new] [nvarchar](20) NULL,
	[ord_ref] [nvarchar](100) NULL,
	[step_roll_order] [int] NULL,
	[step_roll] [bit] NOT NULL,
	[IDlocation] [nvarchar](100) NULL,
	[date_ins] [datetime] NULL,
	[username] [nvarchar](35) NULL,
 CONSTRAINT [order_merge_rows_return_PK] PRIMARY KEY CLUSTERED 
(
	[IDmerge_row_return_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  UserDefinedFunction [dbo].[parView_order_merge_return]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_order_merge_return] (@IDcompany int, @IDmerge bigint)
RETURNS TABLE
AS
RETURN
	/*
	example 
	select IDmerge, IDlot, item, item_desc, um, qty, dim, whdesc, lcdesc, stepRoll 
	from [dbo].[parView_order_merge_lots] (845, '34093')
	estrazione dei lotti da versare ...
	*/
	select LA,LU,PZ,(LA*LU*PZ/1000000) as m2, ord_ref, IDmerge_row_return_id, step_roll_order, step_roll, executed, IDlot_new, whl.[desc] as whldesc, r.IDlocation 
	from dbo.order_merge_rows_return r 
	inner join dbo.order_merge h on r.IDmerge = h.IDmerge
	inner join dbo.warehouse_location whl on whl.IDcompany = r.IDcompany and whl.IDlocation = r.IDlocation   /* Ubicaz. solo del magazzino di versamento */
	where r.IDmerge = @IDmerge and r.IDcompany = @IDcompany
GO
/****** Object:  UserDefinedFunction [dbo].[1111parView_order_production_components]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[1111parView_order_production_components] (@IDcompany int, @LotMain nvarchar(20), @IDwarehouse int)
RETURNS TABLE
AS
RETURN
SELECT o.IDord, o.IDcompany, o.IDlot, r.IDstock, r.IDcomp, 
r.IDitem, item, item_desc, qty_expected, i.um, auto_lot, r.qty, r.executed, u.frazionabile,  
isnull((select sum(qty_stock) /* Lettura della giacenza del componente sul magazzino del lotto main (quello su cui vengono applicati i componenti) */
		from dbo.stock ss 
		inner join dbo.lot ll on ll.IDcompany = ss.IDcompany and ll.IDlot = ss.IDlot 
		where ss.IDcompany = o.IDcompany and ll.IDitem = r.IDitem and ss.IDwarehouse = @IDwarehouse ),0) as qtyOnStock,
isnull((select sum(qty_stock) /* Lettura della giacenza del lotto specifico magazzino del lotto main (quello su cui vengono applicati i componenti) */
		from dbo.stock sss 		 
		where sss.IDcompany = o.IDcompany and sss.IDstock = r.IDStock),0) as qtyOnStockSpecLot,
		/* 2020 04 03 Valore di controllo usato nella pagina per garantire che l'utente non inserisca 2 volte lo stesso lotto, 
		se questo valore è >= 1 non dobbiamo permettere di confermare l'ordine sulla pagina web */
isnull((select count(IDStock) from ( 
		select IDStock
		from dbo.order_production_components 
		where IDcompany = o.IDcompany and IDord = o.IDord and IDStock <> 0  
		group by IDStock
		having COUNT(IDStock) > 1 ) x ),0) as checkDoubleLotSelection					
FROM dbo.order_production o  
inner join dbo.order_production_components r on o.IDcompany = r.IDcompany and o.IDord = r.IDord  
inner join dbo.item i on i.IDitem = r.IDitem  
inner join dbo.um u on u.IDdim = i.um 
where o.IDcompany = @IDcompany and o.IDlot = @LotMain
GO
/****** Object:  UserDefinedFunction [dbo].[1111parView_printCuttingOrder]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[1111parView_printCuttingOrder] (@IDcompany int, @IDlot nvarchar(20))
RETURNS TABLE
AS
RETURN
select executed, o.IDlot, i.IDitem, item, item_desc, dbo.getDimByLot(o.IDcompany, o.IDlot) as lotDim, s.qty_stock, 
l.note as lnote, l.ord_rif as lord_rif, LA, LU, PZ, IDlot_new, r.ord_rif as rowCutOrd_rif 
,isnull(w.[desc],'') as wdesc, isnull(wl.[desc],'') as wldesc, wlc.[desc] as cut_wldesc  
,r.step_roll, r.step_roll_order, IDcut, o.date_planned, logo_on_prints
from dbo.cutting_order o 
inner join dbo.company c on o.IDcompany = c.IDcompany
inner join dbo.lot l on l.IDcompany = o.IDcompany and l.IDlot = o.IDlot 
left outer join dbo.stock s on s.IDcompany = o.IDcompany and s.IDlot = o.IDlot 
left outer join dbo.warehouse w on w.IDcompany = o.IDcompany and s.IDwarehouse = w.IDwarehouse 
left outer join dbo.warehouse_location wl on wl.IDcompany = o.IDcompany and s.IDlocation = wl.IDlocation 
inner join dbo.item i on i.IDitem = l.IDitem 
inner join dbo.cutting_order_row r on r.IDcompany = o.IDcompany and o.IDlot = r.IDlot 
inner join dbo.warehouse_location wlc on wlc.IDcompany = o.IDcompany and r.IDlocation = wlc.IDlocation 
where o.IDcompany = @IDcompany and  o.IDlot = @IDlot
GO
/****** Object:  UserDefinedFunction [dbo].[parView_printLabel]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_printLabel] (@IDcompany int, @IDlotOrIDstock nvarchar(100))
RETURNS TABLE
AS
RETURN
/*
2020 04 15
- questa funziona estrae i dati da stampare sul lotto ricevendo
in input o l IDstock o il codice lotto.
- nel caso in cui il lotto è presente su più magazzini non 
estrarremo la descrizione del magazzino e dell'ubicazione 
2020 04 16, nella query di base, quando usiamo l'idstock, recuperiamo
prima il codice lotto per poter fare la selezione con il codice lotto
in modo da capire quando ci sono più lotti a magazzino.
2021 03 25, aggiunta la tabella company per recuperare il path del logo
*/
select IDcompany, logo_on_prints, IDlot,  IDitem, item, item_desc, dbo.getDimByLotShortDesc(IDcompany, IDlot) as dim, um, IDlot_fornitore, ord_rif
/* Estraiamo la descrizione  mag\loc e la qty solo per quelli presenti a magazzino e solo per quelli che non sono presenti su più magazzini  */
, case when (NumLot = 1)  then (select wh.[desc] from stock s1 
											  inner join warehouse wh 
											  on wh.IDwarehouse = s1.IDwarehouse 
											  and wh.IDcompany = s1.IDcompany and s1.IDlot = LotContr.IDlot and s1.IDcompany = LotContr.IDcompany) else '' end as whdesc
, case when (NumLot = 1) then (select lc.[desc] from stock s2
											    inner join warehouse_location lc 
											    on lc.IDlocation = s2.IDlocation and lc.IDcompany = s2.IDcompany and s2.IDlot = LotContr.IDlot and s2.IDcompany = LotContr.IDcompany) else ''  end as whlcdesc
, case when (NumLot = 1) then (select s3.qty_stock from stock s3 where s3.IDlot = LotContr.IDlot and s3.IDcompany = LotContr.IDcompany) 
	   when (NumLot > 1) then 
							case when (@IDlotOrIDstock is not null) then	/* AB, 2022-03-09 Se è stato specificato l'IDstock prendiamo la qty puntuale anche se sono presenti piu record x lo stesso lotto*/
								 (select x.qty_stock from stock x where x.IDstock = @IDlotOrIDstock)
							else
							NULL
							end
	   /*(select sum(s4.qty_stock) from stock s4 where s4.IDlot = LotContr.IDlot and s4.IDcompany = LotContr.IDcompany) */
	   else 0  end as qty_stock		 
, stepRoll, note, NumLot
from 
		(/*Estrazione di base per vedere se è presente più volte a stock (il campo NumLot) */
		select l.IDcompany, logo_on_prints, l.IDlot, i.IDitem, item, item_desc, um, stepRoll, l.note, count(l.IDlot) as NumLot, IDlot_fornitore, ord_rif
		from lot l
		inner join item i on i.IDitem = l.IDitem
		inner join company c on c.IDcompany = l.IDcompany
		left outer join stock st on st.IDlot = l.IDlot and st.IDcompany = l.IDcompany
		where l.IDcompany = @IDcompany and (l.IDlot = @IDlotOrIDstock  or l.IDlot = (select x.IDlot from stock x where x.IDstock = case when (@IDlotOrIDstock IS NOT NULL) then @IDlotOrIDstock else NULL end))
		group by l.IDcompany, logo_on_prints, l.IDlot,  i.IDitem, item, item_desc, um, stepRoll, l.note, IDlot_fornitore, ord_rif) LotContr
GO
/****** Object:  Table [dbo].[receptions]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[receptions](
	[IDreception] [nvarchar](100) NOT NULL,
	[IDcompany] [int] NOT NULL,
	[IDlot] [nvarchar](20) NOT NULL,
	[IDlot_fornitore] [nvarchar](20) NULL,
	[date_rec] [datetime] NOT NULL,
	[qty] [float] NOT NULL,
	[username] [nvarchar](35) NOT NULL,
	[IDbp] [nvarchar](100) NULL,
	[ord_rif] [nvarchar](100) NULL,
	[delivery_note] [nvarchar](200) NULL,
 CONSTRAINT [receptions_PK] PRIMARY KEY CLUSTERED 
(
	[IDreception] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  UserDefinedFunction [dbo].[1111parView_printLabel_range]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[1111parView_printLabel_range] (@IDcompany int, @IDlot_f as nvarchar(20), @IDlot_t as nvarchar(20), @delivery_note as nvarchar(30))
RETURNS TABLE
AS
RETURN
/*
2021-04-21, estrazione di supporto la stampare range di etichette 
usage: 
select * from [dbo].[parView_printLabel_range](845,'FRPRA21000101','FRPRA21000110','')
select * from [dbo].[parView_printLabel_range](845,'','','7700000000000000275')
*/
  select l.IDlot
  from lot l
  left outer join receptions r on r.IDcompany = l.IDcompany and l.IDlot = r.IDlot
  where l.IDcompany = @IDcompany
  and 
  ((l.IDlot between  @IDlot_f and  @IDlot_t) or @IDlot_f = '' and  @IDlot_t = '')
  and 
  ((r.delivery_note =  @delivery_note) or @delivery_note = '')
  and 
  not (@delivery_note = '' and @IDlot_f = '' and @IDlot_t = '') /* Se non inseriscono nulla non estraiamo nulla */
GO
/****** Object:  UserDefinedFunction [dbo].[parView_stockAtDate]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_stockAtDate] (@IDcompany int, @atDate datetime)
RETURNS TABLE
AS
RETURN
/* 2023-03-28, AB
	usage:  select * from [dbo].[parView_stockAtDate] (845, '2021-03-19 09:02:04.067')
	- tipo di ubicazione (valorizzata o no)
*/
	select *,
			/* Recupero del primo precedente valore alla data inserita */
			case when checked_value = 1 and checked_value_date <= @atDate  then  /* Che il valore sia checked, e in quella data fosse stato checked */
			isnull((select top 1 UnitValue 
					from [dbo].[lot_value] lv 
					where lv.IDcompany = @IDcompany and lv.IDlot = main.IDlot and lv.date_ins <= @atDate
					order by date_ins desc),0) 		
			else  0 end as lotVal
	from 
	(		
		SELECT t.IDlot, i.item, i.item_desc, i.um, w.[desc] as wdesc, wl.[desc] as wldesc, checked_value, checked_value_date,
		case when evaluated = 0 then 'No' else 'Yes' end as evaluated, 
		sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) as [qty]
		FROM dbo.transactions t
		inner join dbo.lot l on t.IDcompany = l.IDcompany and t.IDlot = l.IDlot
		inner join dbo.item i on i.IDitem = l.IDitem
		inner join dbo.warehouse w on w.IDwarehouse = t.IDwarehouse
		inner join dbo.warehouse_location wl on wl.IDlocation = t.IDlocation
		inner join dbo.warehouse_location_type wlt on wl.IDwh_loc_Type = wlt.IDwh_loc_Type
		
		where t.IDcompany = @IDcompany 
		and [date_tran] < = @atDate
		
		group by t.IDlot, i.item, i.item_desc, i.um, w.[desc], wl.[desc], checked_value, checked_value_date, evaluated
		/* L'having esclude tutti i lotti che sono stati azzerati */
		having sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) > 0
	) main
GO
/****** Object:  UserDefinedFunction [dbo].[1111parView_stockItemLimits]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/****** Script for SelectTopNRows command from SSMS  ******/

CREATE FUNCTION [dbo].[1111parView_stockItemLimits] (@IDcompany int, @IDwarehouse int)
RETURNS TABLE
AS
RETURN
/* 
select * from [dbo].[parView_stockItemLimits] (845, 0)
Usando la inner join sulla VISTA estraiamo in automatico solo gli articoli\magazzini che
sono stati inseriti nella tabella dei limiti, ed escludiamo gli altri che 
probabilmente non sono gestiti */
--inner join vw_item_stock_limits_last_values il on il.IDcompany = stock.IDcompany and il.IDitem = lot.IDitem and il.IDwarehouse = stock.IDwarehouse
/* Estraggo solo quelli che sono fuori dai limiti inseriti */
--having  SUM(stock.qty_stock) < il.qty_min or SUM(stock.qty_stock) > il.qty_max

select il.IDwarehouse, il.wdesc, il.IDitem, il.item, il.item_desc, il.um, il.qty_min, il.qty_max, isnull(qty_stock_wh,0) as qty_stock_wh,
	(select SUM(ss.qty_stock)   /* Qty su tutti i magazzini */
	from stock ss 
	inner join lot ll on ss.IDcompany = ll.IDcompany and ss.IDlot = ll.IDlot
	where ss.IDcompany = @IDcompany and ll.IDitem = il.IDitem) as qty_stock
	from vw_item_stock_limits_last_values il left outer join                  /* Left ?? */
		(
		select stock.IDcompany, stock.IDwarehouse, wh.[desc] as wdesc, lot.IDitem , SUM(stock.qty_stock) as qty_stock_wh
		from dbo.stock 
		inner join lot on lot.IDcompany = stock.IDcompany and lot.IDlot = stock.IDlot 
		inner join warehouse wh on wh.IDcompany = stock.IDcompany and stock.IDwarehouse = wh.IDwarehouse 	
		where stock.IDcompany = @IDcompany and 
		(@IDwarehouse = 0 or stock.IDwarehouse = @IDwarehouse)  /* Se non selezionano nulla estraiamo tutti i magazzini */
		group by stock.IDcompany, stock.IDwarehouse, wh.[desc], lot.IDitem 
		) stock_group_by_item_wh
		on il.IDcompany = stock_group_by_item_wh.IDcompany and 
		   il.IDitem = stock_group_by_item_wh.IDitem and 
		   il.IDwarehouse = stock_group_by_item_wh.IDwarehouse
where il.IDcompany = @IDcompany /* ATTENZIONE, essendo in left è obbligatorio avere la condizione anche qui */
and (@IDwarehouse = 0 or il.IDwarehouse = @IDwarehouse)  /* Se non selezionano nulla estraiamo tutti i magazzini */
and isnull(qty_stock_wh,0) < il.qty_min or  isnull(qty_stock_wh,0) > il.qty_max
GO
/****** Object:  UserDefinedFunction [dbo].[parView_stockValueAtDate_locations]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_stockValueAtDate_locations] (@IDcompany int, @atDate datetime, @loc_Type int)
RETURNS TABLE
AS
RETURN
	/*2021-03-13, estrazione di supporto alla [dbo].[parView_stockValueAtDate], quella principale fa riferimento 
	solo alle ubicazioni valorizzate, questa estrae invece ciò che c'è nelle ubicazioni non valorizzate.	
	ATTENZIONE, noi possiamo metterla normalmente in left join perchè potremmo trovarci nella situazione
	in cui un articolo è presente solo in ubicazioni non valorizzate.
	2021-03-20, aggiunto il parametro per il tipo di ubicazione e eliminita la discriminanete per il "no
	valorizzato", escludiamo così una join
	2021-03-20, abbiamo escluso la'estrazione principale è utilizziamo esclusivamente questa "muovendo" il parametro
	del tipo di ubicazione.
	--IDwh_loc_Type 1 Stock
	--IDwh_loc_Type 2 Transit
	--IDwh_loc_Type 3 Quality control
	*/
	select IDitem, sum([qty]) as qty, sum(lotVal) as tval
	from
		(
		select  IDitem,
				LotToDate.[qty],
				LotToDate.[qty] * 
				/* Recupero del primo precedente valore alla data inserita */
				case when l.checked_value = 1 and l.checked_value_date <= @atDate  then  /* Che il valore sia checked, e in quella data fosse stato checked */
					isnull((select top 1 UnitValue 
							from [dbo].[lot_value] lv 
							where lv.IDcompany =  LotToDate.IDcompany and  lv.IDlot = LotToDate.IDlot and lv.date_ins <= @atDate
							order by date_ins desc),0) 		
				  else  0 end as lotVal
				  from
					(
					/* Estrazione dei lotti a stock alla data, questa è "l'estrazione" base, joiniamo le altre
					tabelle su questa in modo da joinare meno record */	
					SELECT tr.IDcompany, IDlot, sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) as [qty]
					FROM dbo.transactions tr
					/* 2021-03-16 Aggiunta discriminante per le ubicazioni non valorizzate (IN QUESTO CASO TRANSIT) */
					inner join dbo.warehouse_location wl on tr.IDcompany = wl.IDcompany and tr.IDlocation = wl.IDlocation
					where tr.IDcompany = @IDcompany 
					and [date_tran] < = @atDate
					and IDwh_loc_Type =  @loc_Type					
					group by tr.IDcompany, IDlot 
					/* L'having esclude tutti i lotti che sono stati azzerati */
					having sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) > 0
					) LotToDate 		  
					inner join dbo.lot l on l.IDcompany = LotToDate.IDcompany and l.IDlot = LotToDate.IDlot		  					
		  ) IDitemToDate
		  group by IDitem
GO
/****** Object:  UserDefinedFunction [dbo].[parView_stockValueAtDate_by_single_item]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_stockValueAtDate_by_single_item] (@IDcompany int, @atDate datetime, @IDitem int)
RETURNS TABLE
AS
RETURN
/*
Usage:
select * from [dbo].[parView_stockValueAtDate_by_single_item] (845, '2021-03-19 09:02:04.067', 3730)
#Recupero id 
select * from item where item = 'NA789'
#ES. per generazione grafici:
select substring(convert(varchar, DataRef, 20),1,16) as DataRef, (select qty from [dbo].[parView_stockValueAtDate_by_single_item] (845, DataRef, 3730)) as qty
from [dbo].[parView_dates_between_dates] ('2020-01-01','2020-12-31', 'm') dates -- base settimana
*/
   select sum([qty]) as qty
   from
   (				/* Estrazione dei lotti a stock alla data, questa è "l'estrazione" base, joiniamo le altre
					tabelle su questa in modo da joinare meno record */	
					SELECT t.IDlot, sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) as [qty]
					FROM dbo.transactions t
					inner join dbo.lot l on t.IDcompany = l.IDcompany and t.IDlot = l.IDlot
					where t.IDcompany = @IDcompany 
					and [date_tran] < = @atDate
					and l.IDitem = @IDitem
					group by t.IDlot
					/* L'having esclude tutti i lotti che sono stati azzerati */
					having sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) > 0
	) LotToDate
GO
/****** Object:  UserDefinedFunction [dbo].[1111parView_TransactionHistory]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[1111parView_TransactionHistory] (@IDcompany int, @data_f datetime, @data_t datetime, @transF int, @item nvarchar(47))
RETURNS TABLE
AS
RETURN
select substring(convert(varchar, date_tran, 20),1,16) AS data_exec, t.IDlot ,i.item 
,i.item_desc, w.[desc] as whdesc, wl.[desc] as whldesc, segno, t.qty, i.um
,tt.[desc] as trdesc, t.ord_rif, t.username, bp.[desc] as bpdesc, dbo.getDimByLot (t.IDcompany, t.IDlot) as dimensions ,l.note,
			(select COUNT(*) 
			from dbo.order_production ord 
			inner join dbo.order_production_components ordC on ord.IDord = ordC.IDord and ord.IDcompany = ordC.IDcompany 
			where ord.IDlot = t.IDlot and ord.IDcompany = t.IDcompany
			) as NumComp,
			d1.val as la, d2.val as lu, d3.val as pz	
			,case when l.eur1 = 0 then 'No' else 'Yes' end as eur1  /* 2020 04 03 */
			,isnull(OrdPrd.IDlot,'') as  OrdPrdLot
from dbo.transactions t 
inner join dbo.transactions_type tt on tt.IDtrantype = t.IDtrantype
inner join dbo.lot l on t.IDcompany = l.IDcompany and t.IDlot = l.IDlot
/*2020 03 25, richiesta delboca di vedere nel report la\lu\pz in colonna, nella visualizzazione manteniamo la funzione */
left outer join lot_dimension d1 on d1.IDlot = l.IDlot and d1.IDcompany = l.IDcompany and d1.IDcar = 'LA'
left outer join lot_dimension d2 on d2.IDlot = l.IDlot and d2.IDcompany = l.IDcompany and d2.IDcar = 'LU'
left outer join lot_dimension d3 on d3.IDlot = l.IDlot and d3.IDcompany = l.IDcompany and d3.IDcar = 'PZ'
inner join dbo.item i on i.IDitem = l.IDitem 
inner join dbo.warehouse w on w.IDcompany = t.IDcompany and t.IDwarehouse = w.IDwarehouse 
inner join dbo.warehouse_location wl on wl.IDcompany = t.IDcompany and t.IDlocation = wl.IDlocation 	
		--Attenzione che il valore deve essere preso in base alla data, non l'ultimo	
left outer join dbo.bp bp on bp.IDcompany = t.IDcompany and bp.IDbp = t.IDbp 
		--Aggiunta ordini di produzione per i componenti
left outer join order_production OrdPrd on OrdPrd.IDcompany = t.IDcompany and OrdPrd.IDord = t.IDprodOrd
where t.IDcompany = @IDcompany and date_tran between @data_f and @data_t and ( 0 = @transF or t.IDtrantype = @transF) 
/* Questa è la condizione per il filtro del tipo transazione, se passo zero seleziono tutto, se no scelgo puntuale*/
/* Condizione sull'articolo (campo libero sulla maschera) se passo il "vuoto" li seleziono tutti */
and (''= ltrim(rtrim(@item)) or i.item = ltrim(rtrim(@item)))
GO
/****** Object:  UserDefinedFunction [dbo].[parView_WAC_ADD_LAY_stock_QtyValue_on_year_end]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_WAC_ADD_LAY_stock_QtyValue_on_year_end] (@IDcompany int, @year smallint)
RETURNS TABLE
AS
RETURN
-- EXAMPLE: select * from [dbo].[parView_WAC_stock_QtyValue_on_year_end] (845, 2020) 
-- EXAMPLE: select IDitem, sum(qty) as qty, sum(qty*UnitValue) as totVal from [dbo].[parView_WAC_stock_QtyValue_on_year_end] (845, 2020) group by IDitem
/* Questa view estrae tutti i lotti a magazzino presenti ad una determinata data (quindi prendendo tutte le transazioni
fino a quella data specifica) con il primo valore assegnato a la qty,
se il valore non è presente mettiamo zero, questa vista viene usata per calcolare per il primo layer con il valore puntuale del lotto 
--2023-01-04, AB, aggiunto il dettaglio per i lotti "configurati"
*/
		select stockAtDate.IDcompany, stockAtDate.IDlot, IDitem, conf_item, qty, isnull(UnitValue,0) as UnitValue, isnull(fv.date_ins,'') as date_ins, checked_value
		from( 
			SELECT tr.IDcompany, tr.IDlot, IDitem, conf_item, checked_value, round(sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end),4) as [qty]
			FROM dbo.transactions tr
			inner join dbo.lot l on l.IDcompany = tr.IDcompany and l.IDlot = tr.IDlot
			where tr.IDcompany = @IDcompany
			and date_tran  <= cast(cast(@year as varchar(4))+'-12-31 23:59:04' as datetime)  /* prendiamo tutte le transazioni fino alla data di fine anno inserito */
			group by tr.IDcompany, tr.IDlot, IDitem, conf_item, checked_value
			having round(sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end),4) <> 0
			)
			stockAtDate
			/* se non ci sono i valori (diversi da zero) oppure ci sono ma non sono "cheked" non li consideriamo */
			/* andiamo in join qui in modo da rendere piu leggera la join principale che arriva dalle transazioni */
			left outer join dbo.vw_lot_first_value fv on fv.IDcompany = stockAtDate.IDcompany and stockAtDate.IDlot = fv.IDlot
GO
/****** Object:  UserDefinedFunction [dbo].[parView_WAC_stock_purchase_transaction]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_WAC_stock_purchase_transaction] (@IDcompany int, @dateStart datetime, @dateEnd datetime)
RETURNS TABLE
AS
RETURN
		-- EXAMPLE: select * from [dbo].[parView_WAC_stock_purchase_transaction] (846, '2000-01-01 22:02:04', '2021-12-31 22:02:04') where IDitem = 926
		/* Questa vista estrae tutte le transazioni di acquisto con la prima valorazzazione valida,
		 con quest aestrazione
		 2022-07-15, AB, aggiunti item e date_tran per richiamare la query dalla pagina di verifica WAC
		 2023-01-04, AB, aggiunto il dettaglio per i lotti "configurati"
		 */
		SELECT tr.IDcompany, i.IDitem, l.conf_item, tr.IDlot,
		sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) as PurchasedQty, 
		sum(case when checked_value = 1 then	/* Se il valore non è "checked" mettiamo zero, sotto il campo note lascia l'appunto */
										(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) * fv.UnitValue
		   else 0 end ) as PurchasedItemValue
		,checked_value
		,fv.UnitValue --2022-07-15 add info on print
		,case when checked_value = 1 then 'Value ok' else 'Excluded, value not checked' end as Note  
		,item
		,substring(convert(varchar, date_tran, 20),1,16) AS date_tran
		,um
		FROM dbo.transactions tr
		inner join dbo.lot l on l.IDcompany = tr.IDcompany and l.IDlot = tr.IDlot	
		inner join dbo.item i on l.IDitem = i.IDitem
		left outer join dbo.vw_lot_first_value fv on fv.IDcompany = tr.IDcompany and tr.IDlot = fv.IDlot  
		where tr.IDcompany = @IDcompany
		and date_tran >= @dateStart
		and date_tran <= @dateEnd															    /* fino alla data inserita */
		and IDtrantype = 1  /* Vengono considerate solo le transazioni di acquisto, le correzioni "4" non vengono utilizzate */ 		
		group by tr.IDcompany, i.IDitem, i.item,		
		l.conf_item, --2023-01-04, AB  	
		tr.IDlot, checked_value, fv.UnitValue, date_tran, um
GO
/****** Object:  UserDefinedFunction [dbo].[parView_WAC_stock_purchase_transaction_group_by_item]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_WAC_stock_purchase_transaction_group_by_item] (@IDcompany int, @dateStart datetime, @dateEnd datetime)
RETURNS TABLE
AS
RETURN
		/* 
		example select * from [dbo].[parView_WAC_stock_purchase_transaction_group_by_item] (846, '2000-01-01 22:02:04', '2021-12-31 22:02:04')
		
		Questa funzione è semplicemente il "group" by della parView_WAC_stock_purchase_transaction, andiamo poi ad usare
	   questa nella "parView_WAC_main" che ci server raggruppata per articolo, ma partiamo dal dettaglio in modo poi da 
	   estrarre per controllo di dettaglio la stessa base di partenza, senza avere un'altra estrazione a doc 
	   
	   --2023-01-04, AB, aggiunto il dettaglio per i lotti "configurati"
	   */
		SELECT IDcompany, IDitem, conf_item, sum(PurchasedQty) as PurchasedQty, sum(PurchasedItemValue) as PurchasedItemValue
		FROM  parView_WAC_stock_purchase_transaction (@IDcompany, @dateStart, @dateEnd)
		group by IDcompany, IDitem, conf_item
GO
/****** Object:  UserDefinedFunction [dbo].[parView_WAC_stock_consumption_transaction]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_WAC_stock_consumption_transaction] (@IDcompany int, @dateStart datetime, @dateEnd datetime)
RETURNS TABLE
AS
RETURN
	-- EXAMPLE: select * from [dbo].[parView_WAC_stock_purchase_transaction_from_startYearToDate] (845, '2021-01-28 22:02:04') 
	/*  Questa vista estrae tutti "consumi" di materiale in in determinato range di periodo escludendo i trasferimenti che falserebbero
		il conteggio, vengono invece considerate tutte le altre operazioni (anche le rettifiche)
        --2023-01-04, AB, aggiunto il dettaglio per i lotti "configurati"
	*/
	--declare @dateStart datetime = '2021-01-01 00:02:04'
	--declare @dateEnd datetime = '2021-01-28 22:02:04'
	select tr_decr.IDcompany, l.IDitem, l.conf_item,  tr_decr.IDlot, sum(tr_decr.qty) as qty_consumata
	from transactions tr_decr
	inner join lot l on tr_decr.IDcompany = l.IDcompany and l.IDlot = tr_decr.IDlot 	
	where
	tr_decr.IDcompany = @IDcompany and tr_decr.segno = '-'   /* Solo le transazioni negative */
	and tr_decr.date_tran >= @dateStart
	and tr_decr.date_tran <= @dateEnd
	--and IDtrantype <> 5								 /* Esludiamo i trasferimenti (+ e - che si annullano, in questo caso i "meno" incrementerebbe i consumi ) */
	and IDtrantype = 3	/*2022-07-05 AB, email di v.bouchart, la sommatoria dei prelievi di prod. + le vendite duplicano la qty */
	group by tr_decr.IDcompany, l.IDitem, l.conf_item,  tr_decr.IDlot
GO
/****** Object:  UserDefinedFunction [dbo].[parView_WAC_stock_consumption_transaction_group_by_item]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_WAC_stock_consumption_transaction_group_by_item] (@IDcompany int, @dateStart datetime, @dateEnd datetime)
RETURNS TABLE
AS
RETURN
	/* Questa funzione è semplicemente il "group" by della parView_WAC_stock_consumption_transaction, andiamo poi ad usare
	   questa nella "parView_WAC_main" che ci server raggruppata per articolo, ma partiamo dal dettaglio in modo poi da 
	   estrarre per controllo di dettaglio la stessa base di partenza, senza avere un'altra estrazione a doc 
	   
	   --2023-01-04, AB, aggiunto il dettaglio per i lotti "configurati"
	   */
	select IDitem, conf_item, sum(qty_consumata) as qty_consumata
	from [dbo].[parView_WAC_stock_consumption_transaction] (@IDcompany , @dateStart, @dateEnd)
	group by IDitem, conf_item
GO
/****** Object:  UserDefinedFunction [dbo].[parView_WAC_stock_transaction_group_by_item]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_WAC_stock_transaction_group_by_item] (@IDcompany int, @dateEnd datetime)
RETURNS TABLE
AS
RETURN
	-- EXAMPLE: select * from [dbo].[parView_WAC_stock_transaction_group_by_item] (845, '2021-01-28 22:02:04') 
	/*  Questa vista estrae lo stock alla data.
	   2023-01-04, AB, aggiunto il dettaglio per i lotti "configurati"
	*/
	--declare @dateStart datetime = '2021-01-01 00:02:04'
	--declare @dateEnd datetime = '2021-01-28 22:02:04'
	select tr.IDcompany, l.IDitem, l.conf_item,  SUM( case when tr.segno = '-' then -1 * tr.qty else tr.qty end ) as qty_stock
	from transactions tr
	inner join lot l on tr.IDcompany = l.IDcompany and l.IDlot = tr.IDlot 	
	where
	tr.IDcompany = @IDcompany 
	and tr.date_tran <= @dateEnd	
	group by tr.IDcompany, l.IDitem
			 ,l.conf_item   --2023-01-04, AB;
GO
/****** Object:  Table [dbo].[WAC_year_layers_item_detail]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WAC_year_layers_item_detail](
	[IDlayer_detail] [nvarchar](100) NOT NULL,
	[IDcompany] [int] NOT NULL,
	[year_layer] [smallint] NOT NULL,
	[IDitem] [nvarchar](100) NULL,
	[item] [nvarchar](47) NULL,
	[stock_qty_start_year] [float] NOT NULL,
	[stock_value_start_year] [float] NOT NULL,
	[purchasedQty_on_the_year] [float] NOT NULL,
	[purchasedItemValue_on_the_year] [float] NOT NULL,
	[stock_qty_end_year] [float] NOT NULL,
	[stock_value_end_year] [float] NOT NULL,
	[wac_avg_cost] [float] NULL,
	[conf_item] [bit] NULL
) ON [PRIMARY]
GO
/****** Object:  UserDefinedFunction [dbo].[parView_WAC_main]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_WAC_main] (@IDcompany int, @AtDate datetime)
RETURNS TABLE
AS
RETURN
	/* Example: select * from [dbo].[parView_WAC_main](845, '2021-01-29 15:46:09.253') order by 12 desc
	Questa vista è composta da 2 parti
	- la prima per gli articoli che sono già presenti nel layer,
	- la seconda per gli articoli che non erano ancora presenti nel layer e che quindi conteggiamo
	  facendo il conteggio puntuale (come abbiamo fatto per il primo anno, quindi non la media ponderata
	  ma la semplice somma puntuale del valore dei lotti)
   2022-02-01, AB, la select sotto la union NON deve estrarre nulla se viene inserita una data dove il layer precedente non
   è stato calcolato, a meno che non si stia calcolando il primo layer
   2022-07-22, AB, modificata pesantemente la gestione delle query in modo da partire dagli articoli:  articoli che non 
   erano presenti nei layer precedenti, non avevano transazioni di acquisto durante l'anno, ma erano in stock venivano 
   skyppati (il valore medio è cmq = 0, ma non è corretto non estrarli).
  
   2023-01-04, AB, aggiunto il dettaglio per i lotti "configurati"
	*/
	/* AVG Cost */
	select [IDlayer_detail], wacl.IDitem, wacl.item
		   ,wacl.conf_item --2023-01-04	
		   ,wacl.year_layer, stock_qty_start_year, stock_value_start_year, stock_qty_end_year,  stock_value_end_year   
		   ,isnull(purch.PurchasedQty,0) as purchased_qty
		   ,isnull(purch.PurchasedItemValue,0) as purchased_value
		   ,isnull(cons.qty_consumata,0) as consumed_qty
		   ,isnull(stock.qty_stock,0) as qty_stock
		   ,case 
				when (wacl.stock_qty_end_year + isnull(purchasedQty,0)) = 0 then wacl.[wac_avg_cost]  /*se non abbiamo stock a fine hanno e non abbiamo acq. prediamo il costo medio prec.*/
				else
				(wacl.stock_value_end_year + isnull(purchasedItemValue,0)) / (wacl.stock_qty_end_year + isnull(purchasedQty,0))	 --avg_cost
		   end as avg_cost 
		   ,'' as notes
	from WAC_year_layers_item_detail wacl
	inner join [dbo].[WAC_year_layers] waclh on wacl.IDcompany = waclh.IDcompany and wacl.year_layer = waclh.year_layer 
	left outer join [dbo].[parView_WAC_stock_purchase_transaction_group_by_item] (@IDcompany, 
																	cast(cast(year(@AtDate) as varchar(4)) + '-01-01 00:00:00.000' as datetime),  /* Primo giorno dell'anno */
																	@AtDate) purch on purch.IDitem = wacl.IDitem
																					  and purch.conf_item = wacl.conf_item --2023-01-04	
	left outer join [dbo].[parView_WAC_stock_consumption_transaction_group_by_item] (@IDcompany, 
																	cast(cast(year(@AtDate) as varchar(4)) + '-01-01 00:00:00.000' as datetime),  /* Primo giorno dell'anno */
																	@AtDate) cons on cons.IDitem = wacl.IDitem
																				  and cons.conf_item = wacl.conf_item -- 2023-01-04 	
    left outer join [dbo].[parView_WAC_stock_transaction_group_by_item](@IDcompany, @AtDate) stock on stock.IDitem = wacl.IDitem 
																								   and  stock.conf_item = wacl.conf_item -- 2023-01-04 	
	where wacl.IDcompany = @IDcompany
	--where wacl.item = 'NA811'   
	/*Quando inseriamo la data di calcolo facciamo riferimento all'ultimo layer inserito, cioè l'anno precedente alla data inserita */
	and wacl.year_layer = year(@AtDate) -1
	/* La codizione qui sorpa funziona anche da controllo di sicurezza, se l'utente inserisce una data che non ha un layer creato nell'anno precedente 
	   non estraggo nulla,per esempio, l'utente inserisce 2025-08-31 e i layer creati arrivano fino al 2022 */
	--2022-02-01
	and waclh.definitive = 1
    UNION
	/* ARTICOLI SENZA LAYER (attenzione che questa vista parametrica viene usata in left join anche qui sopra con i layer 
	ma raggruppata per articolo [parView_WAC_stock_purchase_transaction_group_by_item] */
		select	
		  null, i.IDitem, i.item,
		  cfg.conf_item --2023-01-04	
		, 0, 0, 0, 0 , 0 --record dei layer (che in questa query non sono presenti) 	
		, purchased_qty
		, purchased_value
		, isnull(cons_no_lay.qty_consumata,0) as consumed_qty
		, isnull(stock_no_lay.qty_stock,0) as qty_stock
		, case when isnull(purchased_qty,0)= 0 then 0 else isnull(purchased_value,0)/isnull(purchased_qty,0) end as avg_cost
		, 'No layer found' as notes
		from item i 
		cross join (select 0 as conf_item union select 1 as conf_item) as cfg --2023-01-04	 (prodotto cartesiano per duplicare l'item su conf e no conf)
		left outer join 
						(
						select IDitem, conf_item --2023-01-04			   
						,sum(isnull(PurchasedQty,0)) as purchased_qty
						,sum(isnull(PurchasedItemValue,0)) as purchased_value
						from [dbo].[parView_WAC_stock_purchase_transaction] (@IDcompany, cast(cast(year(@AtDate) as varchar(4)) + '-01-01 00:00:00.000' as datetime),  /* Primo giorno dell'anno */  @AtDate)
						group by IDitem, conf_item
						) purch_no_lay on i.IDitem = purch_no_lay.IDitem
									   and cfg.conf_item = purch_no_lay.conf_item --2023-01-04													 																 																 																
		/*Vado in join esternamente alla select sulle transazione per diminuire l'impatto sul DB */
		left outer join [dbo].[parView_WAC_stock_consumption_transaction_group_by_item] (@IDcompany, 
																cast(cast(year(@AtDate) as varchar(4)) + '-01-01 00:00:00.000' as datetime),  /* Primo giorno dell'anno */
																@AtDate) cons_no_lay on cons_no_lay.IDitem = i.IDitem
																					 and cons_no_lay.conf_item = cfg.conf_item --2023-01-04
		left outer join [dbo].[parView_WAC_stock_transaction_group_by_item](@IDcompany, @AtDate) stock_no_lay on stock_no_lay.IDitem = i.IDitem
																											  and stock_no_lay.conf_item = cfg.conf_item --2023-01-04		
		/* Prendo solo gli articolo che non sono presenti nel layer precedente,
		metto in left join e poi prendo solo quelli con il null ... */
		left outer join [dbo].WAC_year_layers_item_detail left_to_get_only_the_new on left_to_get_only_the_new.IDcompany = @IDcompany 
																				  and left_to_get_only_the_new.year_layer = year(@AtDate) -1 
																				  and left_to_get_only_the_new.conf_item = cfg.conf_item	
		where left_to_get_only_the_new.IDitem is null
		/* --2023-01-04, utilizzato la left per includere anche la logica degli articoli configurati
		i.IDitem not in (select distinct IDitem 
							   from WAC_year_layers_item_detail w 
							   where w.IDcompany = @IDcompany and w.year_layer = year(@AtDate) -1
							   )
		*/
		--2022-02-01, AB, vedi dettagli in intestazione.
		and (	
		/* o stiamo calcolando l'anno successivo ad un layer già calcolato, e quindi è giusto estrarre record da questa vista che, probabilmente, non avevano mai acquistato.
		(non ha senso pensare agli anni precedenti in quanto se non c'erano layer di questo articolo significa che non era mai stato acq.)*/	
		(select max( year_layer) from [WAC_year_layers] w where w.IDcompany = @IDcompany and definitive = 1) = year(@AtDate) - 1
		or 
		/* o non abbiamo mai calcolato nulla, neanche in "non definitivo" quindi dobbiamo creare il primo layer */
		(select count(distinct year_layer)
		from WAC_year_layers w 
		where w.IDcompany = @IDcompany) = 0			
		/* differentemente non estraiamo nulla*/
		)	
		and (isnull(purchased_qty,0) <> 0 or cast(qty_stock as numeric) <> 0)
GO
/****** Object:  UserDefinedFunction [dbo].[parView_WAC_stock_at_date_lot_details_checker]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[parView_WAC_stock_at_date_lot_details_checker] (@IDcompany int, @atDate datetime)
RETURNS TABLE
AS
RETURN
		/*  2023-01-27, AB
			Questa estrazione è solo di controllo, NON entra in gioco per il calcolo del WAC.
			Estrazione di dettaglio utile per il calcolo dell'aging di magazzino, qui estraiamo lo stock alla data 
			con il dettaglio lotto, con la qty ed andiamo in join con 
			example
			select * from  [dbo].[parView_WAC_stock_at_date_lot_details_checker](845, '2022-12-31 23:59:59')
			Questa estrazione, si appoggi alla [parView_WAC_main], quindi ovviamente il mondo "wac" deve essere correttamente
			calcolato (i layer)
		*/
		select Whs, IDlot, date_lot, item, item_desc, conf_item, um, notes, WAC_cost, qty, qty * WAC_cost as stock_valorized_wac, year_layer
		from (
				SELECT wh.[desc] as Whs, t.IDlot, l.date_lot, i.item, item_desc, l.conf_item, i.um, notes, 
				cast(avg_cost as float) as WAC_cost, sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) as [qty],year_layer
				FROM dbo.transactions t
				inner join dbo.lot l on t.IDcompany = l.IDcompany and t.IDlot = l.IDlot
				inner join dbo.item i on l.IDitem = i.IDitem
				inner join dbo.warehouse wh on t.IDcompany = wh.IDcompany and t.IDwarehouse = wh.IDwarehouse
				/*Andiamo in left join così, in caso di problemi sul WAC qui li dovremmo evidenziare */					
				left outer join (select IDitem, avg_cost, notes, year_layer, conf_item from [dbo].[parView_WAC_main](@IDcompany, @atDate)) w on w.IDitem = i.IDitem and w.conf_item = l.conf_item
				where t.IDcompany = @IDcompany 
				and [date_tran] < = @atDate					
				group by wh.[desc], t.IDlot, l.date_lot, i.item, i.item_desc, l.conf_item, i.um, w.notes,  w.avg_cost, year_layer
				/* L'having esclude tutti i lotti che sono stati azzerati */
				having sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) > 0
				) main
			where
			/* Non ha senso stampare con data successiva ad "oggi" */
			cast(@atDate as date) <= cast(getutcdate() as date)
GO
/****** Object:  UserDefinedFunction [dbo].[1111parView_dates_between_dates]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[1111parView_dates_between_dates] (@StartDateTime DATETIME, @EndDateTime DATETIME)
RETURNS TABLE

AS

RETURN

/* Funzione che genera una tabelle con le date contenute tra due date con la possibilità di schegliere
con quale incremento procedere (mese, settimana, giorno)
Utile per la generazione di grafici o comunque per calcolare l'andamento di qualche indice.

Usage:
select * from [dbo].[parView_dates_between_dates] ('2020-06-01','2020-08-31', 'm') -- base mese
select * from [dbo].[parView_dates_between_dates] ('2020-06-01','2020-08-31', 'w') -- base settimana
select * from [dbo].[parView_dates_between_dates] ('2020-06-01','2020-08-31', 'd') -- base giorno


2021-06-14, 
@DaysOrMonths nvarchar(1)
DISABILITATA LA SELEZIONE PER MESE IN QUANTO LA GESTIONE UTC - LOCAL GENERA PROBLEMI
ALLA GENERAZIONE, NELLO SPECIFICO L'ULTIMO GIORNO DEL MESE VIENE CONVERTITO (A SECONDA DEL LOCAL ...) 
IN UN MESE DIVERSO ... ECC 
*/

/*
WITH DateRange(DateData) AS 
(
    SELECT @StartDateTime as Date
    UNION ALL
    SELECT case 
			when @DaysOrMonths = 'd' then DATEADD(day,1,DateData)
		    when @DaysOrMonths = 'm' then DATEADD(month,1,DateData)
			when @DaysOrMonths = 'w' then DATEADD(week,1,DateData)
		   end 
    FROM DateRange 
    WHERE DateData < @EndDateTime
)
SELECT DateData as DataRef
FROM DateRange
*/

WITH DateRange(DateData) AS 
(
    SELECT @StartDateTime as Date
    UNION ALL
    SELECT DATEADD(day,1,DateData)		   
    FROM DateRange 
    WHERE DateData < @EndDateTime
)
SELECT DateData as DataRef
FROM DateRange
GO
/****** Object:  View [dbo].[zzz_vw_LN_codici_varianti]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[zzz_vw_LN_codici_varianti] AS /* da sessione tcchi9430m000 
    recupero numero variante dove non presente per successivo recupero delle dimensioni */
  select art.t_item, 
		 isnull(case when art.t_cpva = 0 then
					var2.t_cpva		--priorità 2
				else
					art.t_cpva		--priorità 1
				end,
					var3.t_cpva)	--priorità 3
				as variante
  from  [ERP-DB02\ERPLN].[erplndb].dbo.ttcibd001815 art
  left outer join [ERP-DB02\ERPLN].[erplndb].dbo.ttipcf540815 var1 on var1.t_item = art.t_item 
  left outer join [ERP-DB02\ERPLN].[erplndb].dbo.ttipcf500815 var2 on var2.t_olid = var1.t_olid 
  left outer join [ERP-DB02\ERPLN].[erplndb].dbo.ttcibd001815 var3 on substring(var3.t_item,10,38) = substring(art.t_item,10,38) and var3.t_cpva <> 0 and substring(var3.t_item,1,7) = 'PRG_VAR'
  where art.t_dscb <> ''
GO
/****** Object:  Table [dbo].[activity_log]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[activity_log](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[log_name] [nvarchar](255) NULL,
	[description] [nvarchar](max) NOT NULL,
	[subject_type] [nvarchar](255) NULL,
	[subject_id] [nvarchar](8) NULL,
	[causer_type] [nvarchar](255) NULL,
	[causer_id] [nvarchar](8) NULL,
	[properties] [nvarchar](max) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[event] [nvarchar](255) NULL,
	[batch_uuid] [uniqueidentifier] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[addresses]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[addresses](
	[id] [nvarchar](100) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[nation_id] [nvarchar](2) NOT NULL,
	[province_id] [nvarchar](100) NULL,
	[city_id] [nvarchar](100) NOT NULL,
	[zip_id] [nvarchar](100) NOT NULL,
	[address] [nvarchar](100) NULL,
	[street_number] [nvarchar](100) NOT NULL,
	[timezone] [nvarchar](100) NOT NULL,
	[company_id] [int] NOT NULL,
 CONSTRAINT [addresses_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[adjustments_history]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[adjustments_history](
	[IDadjustments] [nvarchar](100) NOT NULL,
	[IDcompany] [int] NOT NULL,
	[date_adj] [datetime] NOT NULL,
	[IDlot] [nvarchar](20) NOT NULL,
	[IDwarehouse] [nvarchar](100) NOT NULL,
	[IDlocation] [nvarchar](100) NOT NULL,
	[segno] [nvarchar](1) NOT NULL,
	[qty] [float] NULL,
	[IDadjtype] [int] NOT NULL,
	[IDinventory] [nvarchar](100) NULL,
	[username] [nvarchar](35) NOT NULL,
 CONSTRAINT [adjustments_history_PK] PRIMARY KEY CLUSTERED 
(
	[IDadjustments] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[adjustments_type]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[adjustments_type](
	[IDadjtype] [int] NOT NULL,
	[desc] [nvarchar](30) NULL,
	[invetory] [bit] NULL,
	[ordinamento] [int] NULL,
 CONSTRAINT [adjustments_type_PK] PRIMARY KEY CLUSTERED 
(
	[IDadjtype] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[bp_addresses]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[bp_addresses](
	[id] [nvarchar](100) NOT NULL,
	[bp_id] [nvarchar](100) NOT NULL,
	[address_id] [nvarchar](100) NOT NULL,
	[company_id] [int] NOT NULL,
	[sales_destination] [tinyint] NULL,
	[shipping_destination] [tinyint] NULL,
	[invoice_destination] [tinyint] NULL,
	[payment_origin] [tinyint] NULL,
	[sales_origin] [tinyint] NULL,
	[shipping_origin] [tinyint] NULL,
	[invoice_origin] [tinyint] NULL,
	[payment_destination] [tinyint] NULL,
 CONSTRAINT [bp_addresses_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[bp_categories]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[bp_categories](
	[id] [varchar](100) NOT NULL,
	[description] [nvarchar](100) NOT NULL,
 CONSTRAINT [bp_categories_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[bp_contact]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[bp_contact](
	[id] [nvarchar](100) NOT NULL,
	[bp_id] [nvarchar](100) NOT NULL,
	[contact_id] [nvarchar](100) NOT NULL,
	[company_id] [int] NOT NULL,
 CONSTRAINT [bp_contact_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[cities]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[cities](
	[id] [nvarchar](100) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[company_id] [int] NOT NULL,
	[nation_id] [nvarchar](2) NOT NULL,
	[province_id] [nvarchar](100) NULL,
 CONSTRAINT [cities_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [cities_UN] UNIQUE NONCLUSTERED 
(
	[company_id] ASC,
	[name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[constraint_types]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[constraint_types](
	[id] [nvarchar](100) NOT NULL,
	[label] [nvarchar](100) NOT NULL,
 CONSTRAINT [constraint_types_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[constraints]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[constraints](
	[id] [nvarchar](100) NOT NULL,
	[label] [nvarchar](100) NOT NULL,
	[description] [nvarchar](max) NULL,
	[uuid] [nvarchar](100) NOT NULL,
	[body] [nvarchar](max) NOT NULL,
	[subtype] [nvarchar](100) NOT NULL,
	[constraint_type_id] [nvarchar](100) NOT NULL,
	[dependencies] [nvarchar](max) NULL,
 CONSTRAINT [PK_constraints] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[contacts]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[contacts](
	[id] [nvarchar](100) NOT NULL,
	[name] [varchar](100) NOT NULL,
	[surname] [varchar](100) NOT NULL,
	[qualification] [varchar](100) NULL,
	[department] [varchar](100) NULL,
	[address_id] [nvarchar](100) NULL,
	[office_phone] [varchar](100) NULL,
	[mobile_phone] [varchar](100) NULL,
	[email] [varchar](100) NULL,
	[language] [varchar](3) NULL,
	[company_id] [int] NOT NULL,
 CONSTRAINT [contacts_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[csmLC_wac20220721]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[csmLC_wac20220721](
	[item] [varchar](50) NULL,
	[qty] [varchar](50) NULL,
	[val] [varchar](50) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[currencies]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[currencies](
	[id] [varchar](3) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[symbol] [nvarchar](100) NOT NULL,
 CONSTRAINT [currencies_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[custom_function_categories]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[custom_function_categories](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](100) NULL,
	[parent_id] [bigint] NULL,
 CONSTRAINT [PK_custom_function_categories] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[custom_functions]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[custom_functions](
	[id] [nvarchar](100) NOT NULL,
	[label] [nvarchar](100) NOT NULL,
	[description] [nvarchar](max) NULL,
	[uuid] [nvarchar](100) NOT NULL,
	[arguments] [nvarchar](max) NULL,
	[body] [nvarchar](max) NOT NULL,
	[custom_function_category_id] [bigint] NULL,
	[dependencies] [nvarchar](max) NULL,
 CONSTRAINT [PK_custom_functions] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[feature_standard_product]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[feature_standard_product](
	[standard_product_id] [nvarchar](100) NOT NULL,
	[feature_id] [nvarchar](100) NOT NULL,
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[readonly] [tinyint] NULL,
	[position] [int] NOT NULL,
	[validation_constraint_id] [nvarchar](100) NULL,
	[activation_constraint_id] [nvarchar](100) NULL,
	[dataset_constraint_id] [nvarchar](100) NULL,
	[hidden] [tinyint] NULL,
	[value_constraint_id] [nvarchar](100) NULL,
	[multiple] [tinyint] NULL,
 CONSTRAINT [PK_feature_standard_product] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[feature_types]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[feature_types](
	[id] [nvarchar](100) NOT NULL,
	[label] [nvarchar](100) NOT NULL,
 CONSTRAINT [feature_types_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[features]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[features](
	[id] [nvarchar](100) NOT NULL,
	[label] [nvarchar](100) NOT NULL,
	[feature_type_id] [nvarchar](100) NOT NULL,
 CONSTRAINT [features_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[inventory]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[inventory](
	[IDcompany] [int] NOT NULL,
	[IDinventory] [nvarchar](100) NOT NULL,
	[desc] [nvarchar](100) NULL,
	[completed] [bit] NOT NULL,
	[start_date] [datetime] NULL,
	[end_date] [datetime] NULL,
	[username] [nvarchar](35) NOT NULL,
 CONSTRAINT [inventory_PK] PRIMARY KEY CLUSTERED 
(
	[IDinventory] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[inventory_lots_history]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[inventory_lots_history](
	[IDcompany] [int] NOT NULL,
	[IDinventory] [nvarchar](100) NOT NULL,
	[IDlot] [nvarchar](20) NOT NULL,
	[qty] [float] NOT NULL,
	[invUsername] [nvarchar](35) NOT NULL,
	[invDate_ins] [datetime] NOT NULL,
	[IDwarehouse] [nvarchar](100) NOT NULL,
	[IDlocation] [nvarchar](100) NOT NULL,
	[id] [nvarchar](100) NOT NULL,
 CONSTRAINT [inventory_lots_history_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[log_sync_erplndb]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[log_sync_erplndb](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[sync_at] [datetime] NOT NULL,
	[sync_table] [nvarchar](256) NOT NULL,
	[sync_table_source] [nvarchar](256) NULL,
	[sync_msg] [nvarchar](1024) NOT NULL,
	[sync_errmsg] [nvarchar](2048) NOT NULL,
	[sync_code] [int] NOT NULL,
	[sync_sel] [nchar](10) NULL,
	[sync_del] [int] NOT NULL,
	[sync_ins] [int] NOT NULL,
	[sync_time] [int] NOT NULL,
 CONSTRAINT [PK_synch_erplndb] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[logs]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[logs](
	[IDerr] [nvarchar](100) NOT NULL,
	[IDcompany] [int] NOT NULL,
	[username] [nvarchar](35) NOT NULL,
	[date] [datetime] NOT NULL,
	[vars] [nvarchar](1000) NULL,
	[errors] [nvarchar](1000) NULL,
 CONSTRAINT [logs_PK] PRIMARY KEY CLUSTERED 
(
	[IDerr] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[lot_numeri_primi]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[lot_numeri_primi](
	[IDcompany] [int] NOT NULL,
	[comp_code] [nvarchar](2) NOT NULL,
	[country_code] [nvarchar](2) NOT NULL,
	[type] [nvarchar](2) NOT NULL,
	[year_n] [int] NOT NULL,
	[incrementale] [int] NOT NULL,
	[id] [nvarchar](100) NOT NULL,
 CONSTRAINT [lot_numeri_primi_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[lot_tracking_origin]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[lot_tracking_origin](
	[IDtrack] [nvarchar](100) NOT NULL,
	[IDcompany] [int] NOT NULL,
	[IDlot] [nvarchar](20) NOT NULL,
	[IDlot_origin] [nvarchar](20) NOT NULL,
	[date_track] [datetime] NULL,
 CONSTRAINT [lot_tracking_origin_PK] PRIMARY KEY CLUSTERED 
(
	[IDtrack] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[migrations]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[migrations](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[migration] [nvarchar](255) NOT NULL,
	[batch] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[model_has_permissions]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[model_has_permissions](
	[permission_id] [bigint] NOT NULL,
	[model_type] [nvarchar](255) NOT NULL,
	[model_id] [bigint] NOT NULL,
 CONSTRAINT [model_has_permissions_PK] PRIMARY KEY CLUSTERED 
(
	[permission_id] ASC,
	[model_id] ASC,
	[model_type] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[model_has_roles]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[model_has_roles](
	[role_id] [bigint] NOT NULL,
	[model_type] [nvarchar](255) NOT NULL,
	[model_id] [bigint] NOT NULL,
 CONSTRAINT [model_has_roles_PK] PRIMARY KEY CLUSTERED 
(
	[role_id] ASC,
	[model_id] ASC,
	[model_type] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[naics_codes]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[naics_codes](
	[id] [varchar](100) NOT NULL,
	[description] [varchar](100) NOT NULL,
	[parent_id] [varchar](100) NULL,
	[level] [int] NOT NULL,
 CONSTRAINT [naics_codes_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[nations]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[nations](
	[id] [nvarchar](2) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[iso_alpha_3] [nvarchar](3) NOT NULL,
 CONSTRAINT [nations_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [nations_UN] UNIQUE NONCLUSTERED 
(
	[iso_alpha_3] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[order_split]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[order_split](
	[IDcompany] [int] NOT NULL,
	[IDord] [nvarchar](100) NOT NULL,
	[IDlot] [nvarchar](20) NOT NULL,
	[IDstock] [nvarchar](100) NULL,
	[IDwarehouse] [nvarchar](100) NOT NULL,
	[IDlocation] [nvarchar](100) NOT NULL,
	[qty_ori] [float] NOT NULL,
	[username] [nvarchar](35) NOT NULL,
	[date_creation] [datetime] NULL,
	[date_executed] [datetime] NULL,
	[executed] [bit] NULL,
 CONSTRAINT [order_split_PK] PRIMARY KEY CLUSTERED 
(
	[IDord] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[order_split_row]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[order_split_row](
	[IDRowSplit] [nvarchar](100) NOT NULL,
	[IDcompany] [int] NOT NULL,
	[IDord] [nvarchar](100) NOT NULL,
	[qty_split] [float] NULL,
	[ord_ref] [nvarchar](100) NULL,
	[IDlocation] [nvarchar](100) NULL,
	[IDlot_new] [nvarchar](20) NULL,
 CONSTRAINT [order_split_row_PK] PRIMARY KEY CLUSTERED 
(
	[IDRowSplit] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[permissions]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[permissions](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[guard_name] [nvarchar](255) NOT NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[label] [varchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[provinces]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[provinces](
	[id] [nvarchar](100) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[code] [nvarchar](100) NOT NULL,
	[company_id] [int] NOT NULL,
	[nation_id] [nvarchar](2) NOT NULL,
 CONSTRAINT [provinces_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [provinces_UN] UNIQUE NONCLUSTERED 
(
	[company_id] ASC,
	[nation_id] ASC,
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[role_has_permissions]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[role_has_permissions](
	[role_id] [bigint] NOT NULL,
	[permission_id] [bigint] NOT NULL,
 CONSTRAINT [role_has_permissions_PK] PRIMARY KEY CLUSTERED 
(
	[role_id] ASC,
	[permission_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[roles]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[roles](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[guard_name] [nvarchar](255) NOT NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[system] [bit] NULL,
	[label] [varchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [roles_UN] UNIQUE NONCLUSTERED 
(
	[guard_name] ASC,
	[name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[standard_products]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[standard_products](
	[id] [nvarchar](100) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[item_group_id] [nvarchar](100) NOT NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[code] [nvarchar](100) NOT NULL,
	[company_id] [int] NULL,
	[um_id] [nvarchar](5) NULL,
 CONSTRAINT [standard_products_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [standard_products_UN] UNIQUE NONCLUSTERED 
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[table_sequences]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[table_sequences](
	[company_id] [int] NOT NULL,
	[table_name] [varchar](100) NOT NULL,
	[current] [bigint] NULL,
 CONSTRAINT [table_sequences_PK] PRIMARY KEY CLUSTERED 
(
	[company_id] ASC,
	[table_name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[temp_item_id]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[temp_item_id](
	[item_id] [varchar](100) NOT NULL,
	[new_item_id] [varchar](100) NOT NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[um_dimension]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[um_dimension](
	[IDdim] [nvarchar](5) NOT NULL,
	[IDcar] [nvarchar](20) NOT NULL,
	[Ordinamento] [int] NOT NULL,
	[umdesc] [nchar](10) NULL,
	[um] [nchar](3) NULL,
	[umdescs] [nvarchar](3) NULL,
	[id] [int] IDENTITY(1,1) NOT NULL,
 CONSTRAINT [um_dimension_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [um_dimension_UN] UNIQUE NONCLUSTERED 
(
	[IDdim] ASC,
	[IDcar] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[USA_fifo_value_2022_07_19]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[USA_fifo_value_2022_07_19](
	[Column 0] [varchar](50) NULL,
	[Column 1] [varchar](50) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[zETL_LN_lots_delivery_notes_from_biella]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[zETL_LN_lots_delivery_notes_from_biella](
	[IDrecord] [nvarchar](100) NOT NULL,
	[IDcompany] [int] NOT NULL,
	[t_deln] [nvarchar](19) NOT NULL,
	[t_shpm] [nvarchar](9) NOT NULL,
	[t_pono] [int] NULL,
	[t_crdt] [datetime] NOT NULL,
	[t_item] [nvarchar](47) NOT NULL,
	[t_dscb] [nvarchar](30) NULL,
	[t_ctyp] [nvarchar](3) NULL,
	[t_cpva] [int] NULL,
	[t_clot] [nvarchar](20) NOT NULL,
	[item_std] [nvarchar](47) NOT NULL,
	[IDitem] [nvarchar](100) NOT NULL,
	[eur1] [bit] NULL,
	[t_corn] [nvarchar](30) NULL,
	[t_qshp] [float] NULL,
	[t_amti] [float] NULL,
	[conf_item] [bit] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[zips]    Script Date: 20/09/2023 11:04:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[zips](
	[id] [nvarchar](100) NOT NULL,
	[code] [nvarchar](10) NOT NULL,
	[description] [nvarchar](100) NULL,
	[city_id] [nvarchar](100) NOT NULL,
	[company_id] [int] NOT NULL,
 CONSTRAINT [zips_PK] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [zips_UN] UNIQUE NONCLUSTERED 
(
	[company_id] ASC,
	[city_id] ASC,
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [bp_desc_IDX]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [bp_desc_IDX] ON [dbo].[bp]
(
	[desc] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [bp_IDbp_IDX]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [bp_IDbp_IDX] ON [dbo].[bp]
(
	[IDbp] ASC,
	[IDcompany] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [cutting_order_IDcompany_IDX]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [cutting_order_IDcompany_IDX] ON [dbo].[cutting_order]
(
	[IDcompany] ASC,
	[IDlot] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [cutting_order_row_IDcompany_IDX]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [cutting_order_row_IDcompany_IDX] ON [dbo].[cutting_order_row]
(
	[IDcompany] ASC,
	[IDlot] ASC,
	[IDcut] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [cutting_order_row_IDcompany_IDX2]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [cutting_order_row_IDcompany_IDX2] ON [dbo].[cutting_order_row]
(
	[IDcompany] ASC,
	[IDlot] ASC,
	[IDlot_new] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [inventory_IDcompany_IDX]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [inventory_IDcompany_IDX] ON [dbo].[inventory]
(
	[IDcompany] ASC,
	[IDinventory] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [item]    Script Date: 20/09/2023 11:04:12 ******/
CREATE UNIQUE NONCLUSTERED INDEX [item] ON [dbo].[item]
(
	[item] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [item_standard_product_id_IDX]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [item_standard_product_id_IDX] ON [dbo].[item]
(
	[standard_product_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [item_enabled_IDcompany_IDX]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [item_enabled_IDcompany_IDX] ON [dbo].[item_enabled]
(
	[IDcompany] ASC,
	[IDitem] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [item_group_item_group_IDX]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [item_group_item_group_IDX] ON [dbo].[item_group]
(
	[item_group] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [lot_IDcompany_IDX]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [lot_IDcompany_IDX] ON [dbo].[lot]
(
	[IDcompany] ASC,
	[IDlot] ASC,
	[IDitem] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [lot_IDitem_IDX]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [lot_IDitem_IDX] ON [dbo].[lot]
(
	[IDitem] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [lot_dimension_IDcompany_IDX]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [lot_dimension_IDcompany_IDX] ON [dbo].[lot_dimension]
(
	[IDcompany] ASC,
	[IDlot] ASC,
	[IDcar] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [lot_dimension_val_IDX]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [lot_dimension_val_IDX] ON [dbo].[lot_dimension]
(
	[val] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [lot_numeri_primi_IDcompany_IDX]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [lot_numeri_primi_IDcompany_IDX] ON [dbo].[lot_numeri_primi]
(
	[IDcompany] ASC,
	[comp_code] ASC,
	[country_code] ASC,
	[type] ASC,
	[year_n] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [lot_type_IDcompany_IDX]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [lot_type_IDcompany_IDX] ON [dbo].[lot_type]
(
	[IDcompany] ASC,
	[IDlotType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [lot_value_IDcompany_IDX]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [lot_value_IDcompany_IDX] ON [dbo].[lot_value]
(
	[IDcompany] ASC,
	[IDlot] ASC,
	[date_ins] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [naics_codes_parent_id_IDX]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [naics_codes_parent_id_IDX] ON [dbo].[naics_codes]
(
	[parent_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IDord-IDcompany-IDlot]    Script Date: 20/09/2023 11:04:12 ******/
CREATE UNIQUE NONCLUSTERED INDEX [IDord-IDcompany-IDlot] ON [dbo].[order_production]
(
	[IDord] ASC,
	[IDcompany] ASC,
	[IDlot] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IDord-IDcompany-IDcomp]    Script Date: 20/09/2023 11:04:12 ******/
CREATE UNIQUE NONCLUSTERED INDEX [IDord-IDcompany-IDcomp] ON [dbo].[order_production_components]
(
	[IDord] ASC,
	[IDcompany] ASC,
	[IDcomp] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [order_split-comp-lot-stock]    Script Date: 20/09/2023 11:04:12 ******/
CREATE UNIQUE NONCLUSTERED INDEX [order_split-comp-lot-stock] ON [dbo].[order_split]
(
	[IDcompany] ASC,
	[IDord] ASC,
	[IDlot] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [order_split_ord_comp]    Script Date: 20/09/2023 11:04:12 ******/
CREATE UNIQUE NONCLUSTERED INDEX [order_split_ord_comp] ON [dbo].[order_split_row]
(
	[IDord] ASC,
	[IDcompany] ASC,
	[IDRowSplit] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IDcompany-IDlot-IDlot_fornitore-date-IDrecord]    Script Date: 20/09/2023 11:04:12 ******/
CREATE UNIQUE NONCLUSTERED INDEX [IDcompany-IDlot-IDlot_fornitore-date-IDrecord] ON [dbo].[receptions]
(
	[IDcompany] ASC,
	[IDlot] ASC,
	[IDlot_fornitore] ASC,
	[date_rec] ASC,
	[IDreception] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [date]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [date] ON [dbo].[shipments]
(
	[date_ship] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [lotCode]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [lotCode] ON [dbo].[shipments]
(
	[IDlot] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [shipments_company_date_lot]    Script Date: 20/09/2023 11:04:12 ******/
CREATE UNIQUE NONCLUSTERED INDEX [shipments_company_date_lot] ON [dbo].[shipments]
(
	[IDshipments] ASC,
	[IDcompany] ASC,
	[date_ship] ASC,
	[IDlot] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [NonClusteredIndex-IDlocation]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [NonClusteredIndex-IDlocation] ON [dbo].[stock]
(
	[IDlocation] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [NonClusteredIndex-IDstock]    Script Date: 20/09/2023 11:04:12 ******/
CREATE UNIQUE NONCLUSTERED INDEX [NonClusteredIndex-IDstock] ON [dbo].[stock]
(
	[IDstock] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [NonClusteredIndex-IDwarehouse]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [NonClusteredIndex-IDwarehouse] ON [dbo].[stock]
(
	[IDwarehouse] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [stock_company_lot_warehouse_location]    Script Date: 20/09/2023 11:04:12 ******/
CREATE UNIQUE NONCLUSTERED INDEX [stock_company_lot_warehouse_location] ON [dbo].[stock]
(
	[IDcompany] ASC,
	[IDlot] ASC,
	[IDwarehouse] ASC,
	[IDlocation] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [date_tran]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [date_tran] ON [dbo].[transactions]
(
	[date_tran] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IDlot]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [IDlot] ON [dbo].[transactions]
(
	[IDlot] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IDtrantype]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [IDtrantype] ON [dbo].[transactions]
(
	[IDtrantype] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [transaction_company_date_lot]    Script Date: 20/09/2023 11:04:12 ******/
CREATE UNIQUE NONCLUSTERED INDEX [transaction_company_date_lot] ON [dbo].[transactions]
(
	[IDtransaction] ASC,
	[IDcompany] ASC,
	[date_tran] ASC,
	[IDlot] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [transactions_IDcompany_IDX]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [transactions_IDcompany_IDX] ON [dbo].[transactions]
(
	[IDcompany] ASC,
	[date_tran] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IDdim_IDcar]    Script Date: 20/09/2023 11:04:12 ******/
CREATE UNIQUE NONCLUSTERED INDEX [IDdim_IDcar] ON [dbo].[um_dimension]
(
	[IDdim] ASC,
	[IDcar] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [users_username]    Script Date: 20/09/2023 11:04:12 ******/
CREATE UNIQUE NONCLUSTERED INDEX [users_username] ON [dbo].[users]
(
	[username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [company_wh]    Script Date: 20/09/2023 11:04:12 ******/
CREATE UNIQUE NONCLUSTERED INDEX [company_wh] ON [dbo].[warehouse]
(
	[IDcompany] ASC,
	[IDwarehouse] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [company_loc]    Script Date: 20/09/2023 11:04:12 ******/
CREATE UNIQUE NONCLUSTERED INDEX [company_loc] ON [dbo].[warehouse_location]
(
	[IDcompany] ASC,
	[IDlocation] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IDcompany_IDwh_desc]    Script Date: 20/09/2023 11:04:12 ******/
CREATE UNIQUE NONCLUSTERED INDEX [IDcompany_IDwh_desc] ON [dbo].[warehouse_location]
(
	[IDcompany] ASC,
	[IDwarehouse] ASC,
	[desc] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [NonClusteredIndex-IDlocation]    Script Date: 20/09/2023 11:04:12 ******/
CREATE NONCLUSTERED INDEX [NonClusteredIndex-IDlocation] ON [dbo].[warehouse_location]
(
	[IDlocation] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[bp] ADD  CONSTRAINT [DF_supplier]  DEFAULT ('false') FOR [supplier]
GO
ALTER TABLE [dbo].[bp] ADD  CONSTRAINT [DF_customer]  DEFAULT ('false') FOR [customer]
GO
ALTER TABLE [dbo].[bp] ADD  DEFAULT ((0)) FOR [is_sales_destination]
GO
ALTER TABLE [dbo].[bp] ADD  DEFAULT ((0)) FOR [is_shipping_destination]
GO
ALTER TABLE [dbo].[bp] ADD  DEFAULT ((0)) FOR [is_invoice_destination]
GO
ALTER TABLE [dbo].[bp] ADD  DEFAULT ((0)) FOR [is_sales_origin]
GO
ALTER TABLE [dbo].[bp] ADD  DEFAULT ((0)) FOR [is_shipping_origin]
GO
ALTER TABLE [dbo].[bp] ADD  DEFAULT ((0)) FOR [is_invoice_origin]
GO
ALTER TABLE [dbo].[bp] ADD  DEFAULT ((0)) FOR [is_payment_destination]
GO
ALTER TABLE [dbo].[bp] ADD  DEFAULT ((0)) FOR [sales_destination_has_chiorino_stamp]
GO
ALTER TABLE [dbo].[bp] ADD  DEFAULT ((0)) FOR [shipping_origin_has_inspection]
GO
ALTER TABLE [dbo].[company] ADD  CONSTRAINT [DF__company__read_al__03A67F89]  DEFAULT ('false') FOR [read_alternative_item_code]
GO
ALTER TABLE [dbo].[cutting_order] ADD  CONSTRAINT [DF__cutting_o__execu__534D60F1]  DEFAULT ('false') FOR [executed]
GO
ALTER TABLE [dbo].[cutting_order] ADD  CONSTRAINT [DF__cutting_o__date___19FFD4FC]  DEFAULT (getdate()) FOR [date_planned]
GO
ALTER TABLE [dbo].[cutting_order_row] ADD  CONSTRAINT [DF_cutting_order_row_step_roll]  DEFAULT ('false') FOR [step_roll]
GO
ALTER TABLE [dbo].[item] ADD  CONSTRAINT [DF_item_DefaultUnitValue]  DEFAULT ((0)) FOR [DefaultUnitValue]
GO
ALTER TABLE [dbo].[item] ADD  DEFAULT ((0)) FOR [configured_item]
GO
ALTER TABLE [dbo].[item_enabled] ADD  CONSTRAINT [DF__item_enab__altv___7C055DC1]  DEFAULT ('') FOR [altv_code]
GO
ALTER TABLE [dbo].[item_enabled] ADD  CONSTRAINT [DF__item_enab__altv___7CF981FA]  DEFAULT ('') FOR [altv_desc]
GO
ALTER TABLE [dbo].[item_stock_limits] ADD  CONSTRAINT [DF__item_stoc__enabl__1D9B5BB6]  DEFAULT ('true') FOR [enabled]
GO
ALTER TABLE [dbo].[lot] ADD  CONSTRAINT [DF_lot_stepRoll]  DEFAULT ('false') FOR [stepRoll]
GO
ALTER TABLE [dbo].[lot] ADD  CONSTRAINT [DF_lot_step_roll_order]  DEFAULT ((0)) FOR [step_roll_order]
GO
ALTER TABLE [dbo].[lot] ADD  CONSTRAINT [DF_lot_checked_value]  DEFAULT ('false') FOR [checked_value]
GO
ALTER TABLE [dbo].[lot] ADD  CONSTRAINT [DF_lot_devaluation]  DEFAULT ((0)) FOR [devaluation]
GO
ALTER TABLE [dbo].[lot] ADD  CONSTRAINT [DF__lot__eur1__4BCC3ABA]  DEFAULT ('false') FOR [eur1]
GO
ALTER TABLE [dbo].[lot] ADD  CONSTRAINT [DF__lot__conf_item__3BB5CE82]  DEFAULT ('false') FOR [conf_item]
GO
ALTER TABLE [dbo].[lot] ADD  CONSTRAINT [DF__lot__merged_lot__070CFC19]  DEFAULT ('false') FOR [merged_lot]
GO
ALTER TABLE [dbo].[lot_value] ADD  DEFAULT ((0)) FOR [IDdevaluation]
GO
ALTER TABLE [dbo].[order_merge] ADD  CONSTRAINT [DF__order_mer__execu__59463169]  DEFAULT ('false') FOR [executed]
GO
ALTER TABLE [dbo].[order_merge] ADD  CONSTRAINT [DF__order_mer__date___5A3A55A2]  DEFAULT (getdate()) FOR [date_planned]
GO
ALTER TABLE [dbo].[order_production_components] ADD  CONSTRAINT [DF__order_pro__IDlot__536D5C82]  DEFAULT ('') FOR [IDlot]
GO
ALTER TABLE [dbo].[shipments] ADD  CONSTRAINT [DF__shipments__deliv__6BCEF5F8]  DEFAULT ('') FOR [delivery_note]
GO
ALTER TABLE [dbo].[table_sequences] ADD  DEFAULT ((0)) FOR [current]
GO
ALTER TABLE [dbo].[transactions] ADD  CONSTRAINT [DF__transacti__IDpro__573DED66]  DEFAULT ((0)) FOR [IDprodOrd]
GO
ALTER TABLE [dbo].[um] ADD  CONSTRAINT [DF_um_frazionabile]  DEFAULT ('false') FOR [frazionabile]
GO
ALTER TABLE [dbo].[um] ADD  CONSTRAINT [DF__um__decimal_on_s__76818E95]  DEFAULT ('true') FOR [decimal_on_stock_qty]
GO
ALTER TABLE [dbo].[users] ADD  CONSTRAINT [DF__users__decimal_s__505BE5AD]  DEFAULT (',') FOR [decimal_symb]
GO
ALTER TABLE [dbo].[users] ADD  CONSTRAINT [DF__users__list_sepa__515009E6]  DEFAULT (';') FOR [list_separator]
GO
ALTER TABLE [dbo].[WAC_year_layers] ADD  CONSTRAINT [DF__WAC_year___defin__30AE302A]  DEFAULT ('false') FOR [definitive]
GO
ALTER TABLE [dbo].[WAC_year_layers_item_detail] ADD  CONSTRAINT [DF__WAC_year___conf___3E923B2D]  DEFAULT ('false') FOR [conf_item]
GO
ALTER TABLE [dbo].[warehouse_location] ADD  CONSTRAINT [DF__warehouse__IDwh___41D8BC2C]  DEFAULT ((1)) FOR [IDwh_loc_Type]
GO
ALTER TABLE [dbo].[warehouse_location_type] ADD  CONSTRAINT [DF__warehouse__evalu__40E497F3]  DEFAULT ('true') FOR [evaluated]
GO
ALTER TABLE [dbo].[zETL_LN_lots_delivery_notes_from_biella] ADD  CONSTRAINT [DF__zETL_LN_l__conf___3CA9F2BB]  DEFAULT ('false') FOR [conf_item]
GO
ALTER TABLE [dbo].[addresses]  WITH CHECK ADD  CONSTRAINT [addresses_FK] FOREIGN KEY([nation_id])
REFERENCES [dbo].[nations] ([id])
GO
ALTER TABLE [dbo].[addresses] CHECK CONSTRAINT [addresses_FK]
GO
ALTER TABLE [dbo].[addresses]  WITH CHECK ADD  CONSTRAINT [addresses_FK_1] FOREIGN KEY([province_id])
REFERENCES [dbo].[provinces] ([id])
GO
ALTER TABLE [dbo].[addresses] CHECK CONSTRAINT [addresses_FK_1]
GO
ALTER TABLE [dbo].[addresses]  WITH CHECK ADD  CONSTRAINT [addresses_FK_2] FOREIGN KEY([city_id])
REFERENCES [dbo].[cities] ([id])
GO
ALTER TABLE [dbo].[addresses] CHECK CONSTRAINT [addresses_FK_2]
GO
ALTER TABLE [dbo].[addresses]  WITH CHECK ADD  CONSTRAINT [addresses_FK_3] FOREIGN KEY([zip_id])
REFERENCES [dbo].[zips] ([id])
GO
ALTER TABLE [dbo].[addresses] CHECK CONSTRAINT [addresses_FK_3]
GO
ALTER TABLE [dbo].[addresses]  WITH CHECK ADD  CONSTRAINT [addresses_FK_4] FOREIGN KEY([company_id])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[addresses] CHECK CONSTRAINT [addresses_FK_4]
GO
ALTER TABLE [dbo].[adjustments_history]  WITH NOCHECK ADD  CONSTRAINT [adjustments_history_FK] FOREIGN KEY([IDinventory])
REFERENCES [dbo].[inventory] ([IDinventory])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[adjustments_history] CHECK CONSTRAINT [adjustments_history_FK]
GO
ALTER TABLE [dbo].[adjustments_history]  WITH NOCHECK ADD  CONSTRAINT [adjustments_history_FK_1] FOREIGN KEY([IDadjtype])
REFERENCES [dbo].[adjustments_type] ([IDadjtype])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[adjustments_history] CHECK CONSTRAINT [adjustments_history_FK_1]
GO
ALTER TABLE [dbo].[adjustments_history]  WITH NOCHECK ADD  CONSTRAINT [adjustments_history_FK_2] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[adjustments_history] CHECK CONSTRAINT [adjustments_history_FK_2]
GO
ALTER TABLE [dbo].[adjustments_history]  WITH NOCHECK ADD  CONSTRAINT [adjustments_history_FK_3] FOREIGN KEY([IDwarehouse])
REFERENCES [dbo].[warehouse] ([IDwarehouse])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[adjustments_history] CHECK CONSTRAINT [adjustments_history_FK_3]
GO
ALTER TABLE [dbo].[adjustments_history]  WITH NOCHECK ADD  CONSTRAINT [adjustments_history_FK_4] FOREIGN KEY([IDlocation])
REFERENCES [dbo].[warehouse_location] ([IDlocation])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[adjustments_history] CHECK CONSTRAINT [adjustments_history_FK_4]
GO
ALTER TABLE [dbo].[bp]  WITH NOCHECK ADD  CONSTRAINT [bp_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_1] FOREIGN KEY([address_id])
REFERENCES [dbo].[addresses] ([id])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_1]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_10] FOREIGN KEY([shipping_destination_carrier_bp_id])
REFERENCES [dbo].[bp] ([IDbp])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_10]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_11] FOREIGN KEY([shipping_origin_carrier_bp_id])
REFERENCES [dbo].[bp] ([IDbp])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_11]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_12] FOREIGN KEY([bp_category_id])
REFERENCES [dbo].[bp_categories] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_12]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_14] FOREIGN KEY([naics_l3])
REFERENCES [dbo].[naics_codes] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_14]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_15] FOREIGN KEY([naics_l2])
REFERENCES [dbo].[naics_codes] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_15]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_16] FOREIGN KEY([naics_l1])
REFERENCES [dbo].[naics_codes] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_16]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_17] FOREIGN KEY([sales_destination_contact_id])
REFERENCES [dbo].[contacts] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_17]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_18] FOREIGN KEY([sales_destination_int_contact_id])
REFERENCES [dbo].[contacts] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_18]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_19] FOREIGN KEY([sales_destination_ext_contact_id])
REFERENCES [dbo].[contacts] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_19]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_2] FOREIGN KEY([contact_id])
REFERENCES [dbo].[contacts] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_2]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_20] FOREIGN KEY([shipping_destination_contact_id])
REFERENCES [dbo].[contacts] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_20]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_21] FOREIGN KEY([invoice_destination_contact_id])
REFERENCES [dbo].[contacts] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_21]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_22] FOREIGN KEY([payment_destination_contact_id])
REFERENCES [dbo].[contacts] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_22]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_23] FOREIGN KEY([sales_origin_contact_id])
REFERENCES [dbo].[contacts] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_23]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_24] FOREIGN KEY([shipping_origin_contact_id])
REFERENCES [dbo].[contacts] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_24]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_25] FOREIGN KEY([invoice_origin_contact_id])
REFERENCES [dbo].[contacts] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_25]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_3] FOREIGN KEY([sales_destination_address_id])
REFERENCES [dbo].[addresses] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_3]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_4] FOREIGN KEY([invoice_destination_address_id])
REFERENCES [dbo].[addresses] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_4]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_5] FOREIGN KEY([payment_destination_address_id])
REFERENCES [dbo].[addresses] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_5]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_6] FOREIGN KEY([sales_origin_address_id])
REFERENCES [dbo].[addresses] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_6]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_7] FOREIGN KEY([shipping_origin_address_id])
REFERENCES [dbo].[addresses] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_7]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_8] FOREIGN KEY([invoice_origin_address_id])
REFERENCES [dbo].[addresses] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_8]
GO
ALTER TABLE [dbo].[bp]  WITH CHECK ADD  CONSTRAINT [bp_FK_9] FOREIGN KEY([shipping_destination_address_id])
REFERENCES [dbo].[addresses] ([id])
GO
ALTER TABLE [dbo].[bp] CHECK CONSTRAINT [bp_FK_9]
GO
ALTER TABLE [dbo].[bp_addresses]  WITH CHECK ADD  CONSTRAINT [bp_addresses_FK] FOREIGN KEY([bp_id])
REFERENCES [dbo].[bp] ([IDbp])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[bp_addresses] CHECK CONSTRAINT [bp_addresses_FK]
GO
ALTER TABLE [dbo].[bp_addresses]  WITH CHECK ADD  CONSTRAINT [bp_addresses_FK_1] FOREIGN KEY([address_id])
REFERENCES [dbo].[addresses] ([id])
GO
ALTER TABLE [dbo].[bp_addresses] CHECK CONSTRAINT [bp_addresses_FK_1]
GO
ALTER TABLE [dbo].[bp_addresses]  WITH CHECK ADD  CONSTRAINT [bp_addresses_FK_2] FOREIGN KEY([company_id])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[bp_addresses] CHECK CONSTRAINT [bp_addresses_FK_2]
GO
ALTER TABLE [dbo].[bp_contact]  WITH CHECK ADD  CONSTRAINT [bp_contact_FK] FOREIGN KEY([bp_id])
REFERENCES [dbo].[bp] ([IDbp])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[bp_contact] CHECK CONSTRAINT [bp_contact_FK]
GO
ALTER TABLE [dbo].[bp_contact]  WITH CHECK ADD  CONSTRAINT [bp_contact_FK_2] FOREIGN KEY([contact_id])
REFERENCES [dbo].[contacts] ([id])
GO
ALTER TABLE [dbo].[bp_contact] CHECK CONSTRAINT [bp_contact_FK_2]
GO
ALTER TABLE [dbo].[bp_contact]  WITH CHECK ADD  CONSTRAINT [bp_contact_FK_3] FOREIGN KEY([company_id])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[bp_contact] CHECK CONSTRAINT [bp_contact_FK_3]
GO
ALTER TABLE [dbo].[bp_destinations]  WITH NOCHECK ADD  CONSTRAINT [bp_destinations_FK] FOREIGN KEY([IDbp])
REFERENCES [dbo].[bp] ([IDbp])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[bp_destinations] CHECK CONSTRAINT [bp_destinations_FK]
GO
ALTER TABLE [dbo].[bp_destinations]  WITH NOCHECK ADD  CONSTRAINT [bp_destinations_FK_1] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[bp_destinations] CHECK CONSTRAINT [bp_destinations_FK_1]
GO
ALTER TABLE [dbo].[cities]  WITH CHECK ADD  CONSTRAINT [cities_FK] FOREIGN KEY([company_id])
REFERENCES [dbo].[company] ([IDcompany])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[cities] CHECK CONSTRAINT [cities_FK]
GO
ALTER TABLE [dbo].[cities]  WITH CHECK ADD  CONSTRAINT [cities_FK_1] FOREIGN KEY([province_id])
REFERENCES [dbo].[provinces] ([id])
GO
ALTER TABLE [dbo].[cities] CHECK CONSTRAINT [cities_FK_1]
GO
ALTER TABLE [dbo].[company]  WITH NOCHECK ADD  CONSTRAINT [company_FK] FOREIGN KEY([CSM_bpid_code])
REFERENCES [dbo].[bp] ([IDbp])
GO
ALTER TABLE [dbo].[company] CHECK CONSTRAINT [company_FK]
GO
ALTER TABLE [dbo].[constraints]  WITH NOCHECK ADD  CONSTRAINT [constraints_FK] FOREIGN KEY([constraint_type_id])
REFERENCES [dbo].[constraint_types] ([id])
GO
ALTER TABLE [dbo].[constraints] CHECK CONSTRAINT [constraints_FK]
GO
ALTER TABLE [dbo].[contacts]  WITH CHECK ADD  CONSTRAINT [contacts_FK] FOREIGN KEY([address_id])
REFERENCES [dbo].[addresses] ([id])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[contacts] CHECK CONSTRAINT [contacts_FK]
GO
ALTER TABLE [dbo].[contacts]  WITH CHECK ADD  CONSTRAINT [contacts_FK_2] FOREIGN KEY([company_id])
REFERENCES [dbo].[company] ([IDcompany])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[contacts] CHECK CONSTRAINT [contacts_FK_2]
GO
ALTER TABLE [dbo].[country]  WITH NOCHECK ADD  CONSTRAINT [country_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[country] CHECK CONSTRAINT [country_FK]
GO
ALTER TABLE [dbo].[custom_functions]  WITH NOCHECK ADD  CONSTRAINT [custom_functions_FK] FOREIGN KEY([custom_function_category_id])
REFERENCES [dbo].[custom_function_categories] ([id])
ON UPDATE CASCADE
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[custom_functions] CHECK CONSTRAINT [custom_functions_FK]
GO
ALTER TABLE [dbo].[cutting_order]  WITH NOCHECK ADD  CONSTRAINT [cutting_order_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[cutting_order] CHECK CONSTRAINT [cutting_order_FK]
GO
ALTER TABLE [dbo].[cutting_order_row]  WITH NOCHECK ADD  CONSTRAINT [cutting_order_row_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[cutting_order_row] CHECK CONSTRAINT [cutting_order_row_FK]
GO
ALTER TABLE [dbo].[cutting_order_row]  WITH NOCHECK ADD  CONSTRAINT [cutting_order_row_FK1] FOREIGN KEY([IDlocation])
REFERENCES [dbo].[warehouse_location] ([IDlocation])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[cutting_order_row] CHECK CONSTRAINT [cutting_order_row_FK1]
GO
ALTER TABLE [dbo].[devaluation_history]  WITH NOCHECK ADD  CONSTRAINT [FK_devaluation_history_company] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[devaluation_history] CHECK CONSTRAINT [FK_devaluation_history_company]
GO
ALTER TABLE [dbo].[feature_standard_product]  WITH NOCHECK ADD  CONSTRAINT [feature_standard_product_FK] FOREIGN KEY([validation_constraint_id])
REFERENCES [dbo].[constraints] ([id])
GO
ALTER TABLE [dbo].[feature_standard_product] CHECK CONSTRAINT [feature_standard_product_FK]
GO
ALTER TABLE [dbo].[feature_standard_product]  WITH NOCHECK ADD  CONSTRAINT [feature_standard_product_FK_1] FOREIGN KEY([activation_constraint_id])
REFERENCES [dbo].[constraints] ([id])
GO
ALTER TABLE [dbo].[feature_standard_product] CHECK CONSTRAINT [feature_standard_product_FK_1]
GO
ALTER TABLE [dbo].[feature_standard_product]  WITH NOCHECK ADD  CONSTRAINT [feature_standard_product_FK_2] FOREIGN KEY([dataset_constraint_id])
REFERENCES [dbo].[constraints] ([id])
GO
ALTER TABLE [dbo].[feature_standard_product] CHECK CONSTRAINT [feature_standard_product_FK_2]
GO
ALTER TABLE [dbo].[feature_standard_product]  WITH NOCHECK ADD  CONSTRAINT [feature_standard_product_FK_3] FOREIGN KEY([value_constraint_id])
REFERENCES [dbo].[constraints] ([id])
GO
ALTER TABLE [dbo].[feature_standard_product] CHECK CONSTRAINT [feature_standard_product_FK_3]
GO
ALTER TABLE [dbo].[feature_standard_product]  WITH NOCHECK ADD  CONSTRAINT [feature_standard_product_FK_5] FOREIGN KEY([feature_id])
REFERENCES [dbo].[features] ([id])
GO
ALTER TABLE [dbo].[feature_standard_product] CHECK CONSTRAINT [feature_standard_product_FK_5]
GO
ALTER TABLE [dbo].[features]  WITH NOCHECK ADD  CONSTRAINT [features_FK] FOREIGN KEY([feature_type_id])
REFERENCES [dbo].[feature_types] ([id])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[features] CHECK CONSTRAINT [features_FK]
GO
ALTER TABLE [dbo].[inventory]  WITH NOCHECK ADD  CONSTRAINT [FK_inventory_company] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[inventory] CHECK CONSTRAINT [FK_inventory_company]
GO
ALTER TABLE [dbo].[inventory_lots_history]  WITH NOCHECK ADD  CONSTRAINT [FK_inventory_lots_history_company] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[inventory_lots_history] CHECK CONSTRAINT [FK_inventory_lots_history_company]
GO
ALTER TABLE [dbo].[inventory_lots_history]  WITH NOCHECK ADD  CONSTRAINT [inventory_lots_history_FK] FOREIGN KEY([IDwarehouse])
REFERENCES [dbo].[warehouse] ([IDwarehouse])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[inventory_lots_history] CHECK CONSTRAINT [inventory_lots_history_FK]
GO
ALTER TABLE [dbo].[inventory_lots_history]  WITH NOCHECK ADD  CONSTRAINT [inventory_lots_history_FK_1] FOREIGN KEY([IDlocation])
REFERENCES [dbo].[warehouse_location] ([IDlocation])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[inventory_lots_history] CHECK CONSTRAINT [inventory_lots_history_FK_1]
GO
ALTER TABLE [dbo].[inventory_lots_history]  WITH NOCHECK ADD  CONSTRAINT [inventory_lots_history_FK_2] FOREIGN KEY([IDinventory])
REFERENCES [dbo].[inventory] ([IDinventory])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[inventory_lots_history] CHECK CONSTRAINT [inventory_lots_history_FK_2]
GO
ALTER TABLE [dbo].[item]  WITH NOCHECK ADD  CONSTRAINT [item_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[item] CHECK CONSTRAINT [item_FK]
GO
ALTER TABLE [dbo].[item]  WITH NOCHECK ADD  CONSTRAINT [item_FK_1] FOREIGN KEY([standard_product_id])
REFERENCES [dbo].[standard_products] ([id])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[item] CHECK CONSTRAINT [item_FK_1]
GO
ALTER TABLE [dbo].[item_enabled]  WITH NOCHECK ADD  CONSTRAINT [FK_item_enabled_company] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[item_enabled] CHECK CONSTRAINT [FK_item_enabled_company]
GO
ALTER TABLE [dbo].[item_enabled]  WITH NOCHECK ADD  CONSTRAINT [item_enabled_FK] FOREIGN KEY([IDitem])
REFERENCES [dbo].[item] ([IDitem])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[item_enabled] CHECK CONSTRAINT [item_enabled_FK]
GO
ALTER TABLE [dbo].[item_group]  WITH NOCHECK ADD  CONSTRAINT [item_group_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[item_group] CHECK CONSTRAINT [item_group_FK]
GO
ALTER TABLE [dbo].[item_stock_limits]  WITH NOCHECK ADD  CONSTRAINT [item_stock_limits_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[item_stock_limits] CHECK CONSTRAINT [item_stock_limits_FK]
GO
ALTER TABLE [dbo].[item_stock_limits]  WITH NOCHECK ADD  CONSTRAINT [item_stock_limits_FK_1] FOREIGN KEY([IDwarehouse])
REFERENCES [dbo].[warehouse] ([IDwarehouse])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[item_stock_limits] CHECK CONSTRAINT [item_stock_limits_FK_1]
GO
ALTER TABLE [dbo].[item_stock_limits]  WITH NOCHECK ADD  CONSTRAINT [item_stock_limits_FK_2] FOREIGN KEY([IDitem])
REFERENCES [dbo].[item] ([IDitem])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[item_stock_limits] CHECK CONSTRAINT [item_stock_limits_FK_2]
GO
ALTER TABLE [dbo].[logs]  WITH NOCHECK ADD  CONSTRAINT [logs_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[logs] CHECK CONSTRAINT [logs_FK]
GO
ALTER TABLE [dbo].[lot]  WITH NOCHECK ADD  CONSTRAINT [FK_lot_company] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[lot] CHECK CONSTRAINT [FK_lot_company]
GO
ALTER TABLE [dbo].[lot]  WITH NOCHECK ADD  CONSTRAINT [lot_FK] FOREIGN KEY([IDbp])
REFERENCES [dbo].[bp] ([IDbp])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[lot] CHECK CONSTRAINT [lot_FK]
GO
ALTER TABLE [dbo].[lot]  WITH CHECK ADD  CONSTRAINT [lot_FK_2] FOREIGN KEY([IDitem])
REFERENCES [dbo].[item] ([IDitem])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[lot] CHECK CONSTRAINT [lot_FK_2]
GO
ALTER TABLE [dbo].[lot_dimension]  WITH NOCHECK ADD  CONSTRAINT [lot_dimension_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[lot_dimension] CHECK CONSTRAINT [lot_dimension_FK]
GO
ALTER TABLE [dbo].[lot_numeri_primi]  WITH NOCHECK ADD  CONSTRAINT [lot_numeri_primi_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[lot_numeri_primi] CHECK CONSTRAINT [lot_numeri_primi_FK]
GO
ALTER TABLE [dbo].[lot_tracking_origin]  WITH NOCHECK ADD  CONSTRAINT [lot_tracking_origin_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[lot_tracking_origin] CHECK CONSTRAINT [lot_tracking_origin_FK]
GO
ALTER TABLE [dbo].[lot_type]  WITH NOCHECK ADD  CONSTRAINT [lot_type_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[lot_type] CHECK CONSTRAINT [lot_type_FK]
GO
ALTER TABLE [dbo].[lot_value]  WITH NOCHECK ADD  CONSTRAINT [lot_value_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[lot_value] CHECK CONSTRAINT [lot_value_FK]
GO
ALTER TABLE [dbo].[lot_value]  WITH NOCHECK ADD  CONSTRAINT [lot_value_FK_2] FOREIGN KEY([IDdevaluation])
REFERENCES [dbo].[devaluation_history] ([IDdevaluation])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[lot_value] CHECK CONSTRAINT [lot_value_FK_2]
GO
ALTER TABLE [dbo].[material_issue_temp]  WITH NOCHECK ADD  CONSTRAINT [material_issue_temp_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[material_issue_temp] CHECK CONSTRAINT [material_issue_temp_FK]
GO
ALTER TABLE [dbo].[material_issue_temp]  WITH NOCHECK ADD  CONSTRAINT [material_issue_temp_FK_2] FOREIGN KEY([IDStock])
REFERENCES [dbo].[stock] ([IDstock])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[material_issue_temp] CHECK CONSTRAINT [material_issue_temp_FK_2]
GO
ALTER TABLE [dbo].[material_transfer_temp]  WITH NOCHECK ADD  CONSTRAINT [material_transfer_temp_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[material_transfer_temp] CHECK CONSTRAINT [material_transfer_temp_FK]
GO
ALTER TABLE [dbo].[material_transfer_temp]  WITH NOCHECK ADD  CONSTRAINT [material_transfer_temp_FK_2] FOREIGN KEY([IDStock])
REFERENCES [dbo].[stock] ([IDstock])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[material_transfer_temp] CHECK CONSTRAINT [material_transfer_temp_FK_2]
GO
ALTER TABLE [dbo].[model_has_permissions]  WITH NOCHECK ADD  CONSTRAINT [model_has_permissions_permission_id_foreign] FOREIGN KEY([permission_id])
REFERENCES [dbo].[permissions] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[model_has_permissions] CHECK CONSTRAINT [model_has_permissions_permission_id_foreign]
GO
ALTER TABLE [dbo].[model_has_roles]  WITH NOCHECK ADD  CONSTRAINT [model_has_roles_role_id_foreign] FOREIGN KEY([role_id])
REFERENCES [dbo].[roles] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[model_has_roles] CHECK CONSTRAINT [model_has_roles_role_id_foreign]
GO
ALTER TABLE [dbo].[order_merge]  WITH NOCHECK ADD  CONSTRAINT [FK_order_merge_company] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[order_merge] CHECK CONSTRAINT [FK_order_merge_company]
GO
ALTER TABLE [dbo].[order_merge_rows_picking]  WITH NOCHECK ADD  CONSTRAINT [order_merge_rows_picking_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[order_merge_rows_picking] CHECK CONSTRAINT [order_merge_rows_picking_FK]
GO
ALTER TABLE [dbo].[order_merge_rows_picking]  WITH NOCHECK ADD  CONSTRAINT [order_merge_rows_picking_FK_1] FOREIGN KEY([IDmerge])
REFERENCES [dbo].[order_merge] ([IDmerge])
GO
ALTER TABLE [dbo].[order_merge_rows_picking] CHECK CONSTRAINT [order_merge_rows_picking_FK_1]
GO
ALTER TABLE [dbo].[order_merge_rows_return]  WITH NOCHECK ADD  CONSTRAINT [order_merge_rows_return_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[order_merge_rows_return] CHECK CONSTRAINT [order_merge_rows_return_FK]
GO
ALTER TABLE [dbo].[order_merge_rows_return]  WITH NOCHECK ADD  CONSTRAINT [order_merge_rows_return_FK_1] FOREIGN KEY([IDmerge])
REFERENCES [dbo].[order_merge] ([IDmerge])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[order_merge_rows_return] CHECK CONSTRAINT [order_merge_rows_return_FK_1]
GO
ALTER TABLE [dbo].[order_merge_rows_return]  WITH NOCHECK ADD  CONSTRAINT [order_merge_rows_return_FK_2] FOREIGN KEY([IDlocation])
REFERENCES [dbo].[warehouse_location] ([IDlocation])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[order_merge_rows_return] CHECK CONSTRAINT [order_merge_rows_return_FK_2]
GO
ALTER TABLE [dbo].[order_merge_rows_return]  WITH NOCHECK ADD  CONSTRAINT [order_merge_rows_return_FK_3] FOREIGN KEY([IDlot_new])
REFERENCES [dbo].[lot] ([IDlot])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[order_merge_rows_return] CHECK CONSTRAINT [order_merge_rows_return_FK_3]
GO
ALTER TABLE [dbo].[order_production]  WITH NOCHECK ADD  CONSTRAINT [order_production_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[order_production] CHECK CONSTRAINT [order_production_FK]
GO
ALTER TABLE [dbo].[order_production]  WITH NOCHECK ADD  CONSTRAINT [order_production_FK_1] FOREIGN KEY([IDwarehouse])
REFERENCES [dbo].[warehouse] ([IDwarehouse])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[order_production] CHECK CONSTRAINT [order_production_FK_1]
GO
ALTER TABLE [dbo].[order_production]  WITH NOCHECK ADD  CONSTRAINT [order_production_FK_2] FOREIGN KEY([IDlocation])
REFERENCES [dbo].[warehouse_location] ([IDlocation])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[order_production] CHECK CONSTRAINT [order_production_FK_2]
GO
ALTER TABLE [dbo].[order_production_components]  WITH NOCHECK ADD  CONSTRAINT [order_production_components_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[order_production_components] CHECK CONSTRAINT [order_production_components_FK]
GO
ALTER TABLE [dbo].[order_production_components]  WITH NOCHECK ADD  CONSTRAINT [order_production_components_FK_1] FOREIGN KEY([IDord])
REFERENCES [dbo].[order_production] ([IDord])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[order_production_components] CHECK CONSTRAINT [order_production_components_FK_1]
GO
ALTER TABLE [dbo].[order_production_components]  WITH NOCHECK ADD  CONSTRAINT [order_production_components_FK_2] FOREIGN KEY([IDitem])
REFERENCES [dbo].[item] ([IDitem])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[order_production_components] CHECK CONSTRAINT [order_production_components_FK_2]
GO
ALTER TABLE [dbo].[order_production_components]  WITH NOCHECK ADD  CONSTRAINT [order_production_components_FK_5] FOREIGN KEY([IDStock])
REFERENCES [dbo].[stock] ([IDstock])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[order_production_components] CHECK CONSTRAINT [order_production_components_FK_5]
GO
ALTER TABLE [dbo].[order_split]  WITH NOCHECK ADD  CONSTRAINT [order_split_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[order_split] CHECK CONSTRAINT [order_split_FK]
GO
ALTER TABLE [dbo].[order_split]  WITH NOCHECK ADD  CONSTRAINT [order_split_FK_1] FOREIGN KEY([IDlocation])
REFERENCES [dbo].[warehouse_location] ([IDlocation])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[order_split] CHECK CONSTRAINT [order_split_FK_1]
GO
ALTER TABLE [dbo].[order_split]  WITH NOCHECK ADD  CONSTRAINT [order_split_FK_2] FOREIGN KEY([IDwarehouse])
REFERENCES [dbo].[warehouse] ([IDwarehouse])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[order_split] CHECK CONSTRAINT [order_split_FK_2]
GO
ALTER TABLE [dbo].[order_split]  WITH NOCHECK ADD  CONSTRAINT [order_split_FK_5] FOREIGN KEY([IDstock])
REFERENCES [dbo].[stock] ([IDstock])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[order_split] CHECK CONSTRAINT [order_split_FK_5]
GO
ALTER TABLE [dbo].[order_split_row]  WITH NOCHECK ADD  CONSTRAINT [order_split_row_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[order_split_row] CHECK CONSTRAINT [order_split_row_FK]
GO
ALTER TABLE [dbo].[order_split_row]  WITH NOCHECK ADD  CONSTRAINT [order_split_row_FK_2] FOREIGN KEY([IDord])
REFERENCES [dbo].[order_split] ([IDord])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[order_split_row] CHECK CONSTRAINT [order_split_row_FK_2]
GO
ALTER TABLE [dbo].[order_split_row]  WITH NOCHECK ADD  CONSTRAINT [order_split_row_FK_3] FOREIGN KEY([IDlocation])
REFERENCES [dbo].[warehouse_location] ([IDlocation])
GO
ALTER TABLE [dbo].[order_split_row] CHECK CONSTRAINT [order_split_row_FK_3]
GO
ALTER TABLE [dbo].[provinces]  WITH CHECK ADD  CONSTRAINT [provinces_FK] FOREIGN KEY([company_id])
REFERENCES [dbo].[company] ([IDcompany])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[provinces] CHECK CONSTRAINT [provinces_FK]
GO
ALTER TABLE [dbo].[provinces]  WITH CHECK ADD  CONSTRAINT [provinces_FK_1] FOREIGN KEY([nation_id])
REFERENCES [dbo].[nations] ([id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[provinces] CHECK CONSTRAINT [provinces_FK_1]
GO
ALTER TABLE [dbo].[receptions]  WITH NOCHECK ADD  CONSTRAINT [receptions_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[receptions] CHECK CONSTRAINT [receptions_FK]
GO
ALTER TABLE [dbo].[receptions]  WITH NOCHECK ADD  CONSTRAINT [receptions_FK_4] FOREIGN KEY([IDbp])
REFERENCES [dbo].[bp] ([IDbp])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[receptions] CHECK CONSTRAINT [receptions_FK_4]
GO
ALTER TABLE [dbo].[role_has_permissions]  WITH NOCHECK ADD  CONSTRAINT [role_has_permissions_FK] FOREIGN KEY([role_id])
REFERENCES [dbo].[roles] ([id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[role_has_permissions] CHECK CONSTRAINT [role_has_permissions_FK]
GO
ALTER TABLE [dbo].[role_has_permissions]  WITH NOCHECK ADD  CONSTRAINT [role_has_permissions_FK_2] FOREIGN KEY([permission_id])
REFERENCES [dbo].[permissions] ([id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[role_has_permissions] CHECK CONSTRAINT [role_has_permissions_FK_2]
GO
ALTER TABLE [dbo].[shipments]  WITH NOCHECK ADD  CONSTRAINT [FK_shipments_company] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[shipments] CHECK CONSTRAINT [FK_shipments_company]
GO
ALTER TABLE [dbo].[shipments]  WITH NOCHECK ADD  CONSTRAINT [shipments_FK] FOREIGN KEY([IDbp])
REFERENCES [dbo].[bp] ([IDbp])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[shipments] CHECK CONSTRAINT [shipments_FK]
GO
ALTER TABLE [dbo].[shipments]  WITH NOCHECK ADD  CONSTRAINT [shipments_FK_3] FOREIGN KEY([IDdestination])
REFERENCES [dbo].[bp_destinations] ([IDdestination])
GO
ALTER TABLE [dbo].[shipments] CHECK CONSTRAINT [shipments_FK_3]
GO
ALTER TABLE [dbo].[standard_products]  WITH NOCHECK ADD  CONSTRAINT [standard_products_FK] FOREIGN KEY([um_id])
REFERENCES [dbo].[um] ([IDdim])
ON UPDATE CASCADE
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[standard_products] CHECK CONSTRAINT [standard_products_FK]
GO
ALTER TABLE [dbo].[stock]  WITH NOCHECK ADD  CONSTRAINT [FK_stock_company] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[stock] CHECK CONSTRAINT [FK_stock_company]
GO
ALTER TABLE [dbo].[stock]  WITH NOCHECK ADD  CONSTRAINT [stock_FK_1] FOREIGN KEY([IDlocation])
REFERENCES [dbo].[warehouse_location] ([IDlocation])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[stock] CHECK CONSTRAINT [stock_FK_1]
GO
ALTER TABLE [dbo].[stock]  WITH NOCHECK ADD  CONSTRAINT [stock_FK_3] FOREIGN KEY([IDwarehouse])
REFERENCES [dbo].[warehouse] ([IDwarehouse])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[stock] CHECK CONSTRAINT [stock_FK_3]
GO
ALTER TABLE [dbo].[stock]  WITH NOCHECK ADD  CONSTRAINT [stock_FK_5] FOREIGN KEY([IDinventory])
REFERENCES [dbo].[inventory] ([IDinventory])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[stock] CHECK CONSTRAINT [stock_FK_5]
GO
ALTER TABLE [dbo].[table_sequences]  WITH NOCHECK ADD  CONSTRAINT [table_sequences_FK] FOREIGN KEY([company_id])
REFERENCES [dbo].[company] ([IDcompany])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[table_sequences] CHECK CONSTRAINT [table_sequences_FK]
GO
ALTER TABLE [dbo].[transactions]  WITH NOCHECK ADD  CONSTRAINT [FK_transactions_company] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[transactions] CHECK CONSTRAINT [FK_transactions_company]
GO
ALTER TABLE [dbo].[transactions]  WITH NOCHECK ADD  CONSTRAINT [transactions_FK_1] FOREIGN KEY([IDtrantype])
REFERENCES [dbo].[transactions_type] ([IDtrantype])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[transactions] CHECK CONSTRAINT [transactions_FK_1]
GO
ALTER TABLE [dbo].[transactions]  WITH NOCHECK ADD  CONSTRAINT [transactions_FK_2] FOREIGN KEY([IDwarehouse])
REFERENCES [dbo].[warehouse] ([IDwarehouse])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[transactions] CHECK CONSTRAINT [transactions_FK_2]
GO
ALTER TABLE [dbo].[transactions]  WITH NOCHECK ADD  CONSTRAINT [transactions_FK_3] FOREIGN KEY([IDlocation])
REFERENCES [dbo].[warehouse_location] ([IDlocation])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[transactions] CHECK CONSTRAINT [transactions_FK_3]
GO
ALTER TABLE [dbo].[transactions]  WITH NOCHECK ADD  CONSTRAINT [transactions_FK_5] FOREIGN KEY([IDbp])
REFERENCES [dbo].[bp] ([IDbp])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[transactions] CHECK CONSTRAINT [transactions_FK_5]
GO
ALTER TABLE [dbo].[transactions]  WITH NOCHECK ADD  CONSTRAINT [transactions_FK_6] FOREIGN KEY([IDprodOrd])
REFERENCES [dbo].[order_production] ([IDord])
GO
ALTER TABLE [dbo].[transactions] CHECK CONSTRAINT [transactions_FK_6]
GO
ALTER TABLE [dbo].[users]  WITH NOCHECK ADD  CONSTRAINT [FK_users_company] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[users] CHECK CONSTRAINT [FK_users_company]
GO
ALTER TABLE [dbo].[users]  WITH NOCHECK ADD  CONSTRAINT [users_FK] FOREIGN KEY([IDwarehouseUserDef])
REFERENCES [dbo].[warehouse] ([IDwarehouse])
ON UPDATE CASCADE
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[users] CHECK CONSTRAINT [users_FK]
GO
ALTER TABLE [dbo].[WAC_year_layers]  WITH NOCHECK ADD  CONSTRAINT [WAC_year_layers_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[WAC_year_layers] CHECK CONSTRAINT [WAC_year_layers_FK]
GO
ALTER TABLE [dbo].[WAC_year_layers_item_detail]  WITH NOCHECK ADD  CONSTRAINT [WAC_year_layers_item_detail_FK] FOREIGN KEY([IDitem])
REFERENCES [dbo].[item] ([IDitem])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[WAC_year_layers_item_detail] CHECK CONSTRAINT [WAC_year_layers_item_detail_FK]
GO
ALTER TABLE [dbo].[WAC_year_layers_item_detail]  WITH CHECK ADD  CONSTRAINT [WAC_year_layers_item_detail_FK_1] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[WAC_year_layers_item_detail] CHECK CONSTRAINT [WAC_year_layers_item_detail_FK_1]
GO
ALTER TABLE [dbo].[warehouse]  WITH NOCHECK ADD  CONSTRAINT [warehouse_FK] FOREIGN KEY([IDcountry])
REFERENCES [dbo].[country] ([IDcountry])
GO
ALTER TABLE [dbo].[warehouse] CHECK CONSTRAINT [warehouse_FK]
GO
ALTER TABLE [dbo].[warehouse]  WITH NOCHECK ADD  CONSTRAINT [warehouse_FK_34] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[warehouse] CHECK CONSTRAINT [warehouse_FK_34]
GO
ALTER TABLE [dbo].[warehouse_location]  WITH NOCHECK ADD  CONSTRAINT [warehouse_location_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[warehouse_location] CHECK CONSTRAINT [warehouse_location_FK]
GO
ALTER TABLE [dbo].[warehouse_location]  WITH NOCHECK ADD  CONSTRAINT [warehouse_location_FK_4] FOREIGN KEY([IDwh_loc_Type])
REFERENCES [dbo].[warehouse_location_type] ([IDwh_loc_Type])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[warehouse_location] CHECK CONSTRAINT [warehouse_location_FK_4]
GO
ALTER TABLE [dbo].[warehouse_location]  WITH NOCHECK ADD  CONSTRAINT [warehouse_location_FK-2] FOREIGN KEY([IDwarehouse])
REFERENCES [dbo].[warehouse] ([IDwarehouse])
GO
ALTER TABLE [dbo].[warehouse_location] CHECK CONSTRAINT [warehouse_location_FK-2]
GO
ALTER TABLE [dbo].[zETL_LN_sales_order_open]  WITH NOCHECK ADD  CONSTRAINT [zETL_LN_sales_order_open_FK] FOREIGN KEY([IDcompany])
REFERENCES [dbo].[company] ([IDcompany])
GO
ALTER TABLE [dbo].[zETL_LN_sales_order_open] CHECK CONSTRAINT [zETL_LN_sales_order_open_FK]
GO
ALTER TABLE [dbo].[zips]  WITH CHECK ADD  CONSTRAINT [zips_FK] FOREIGN KEY([company_id])
REFERENCES [dbo].[company] ([IDcompany])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[zips] CHECK CONSTRAINT [zips_FK]
GO
ALTER TABLE [dbo].[zips]  WITH CHECK ADD  CONSTRAINT [zips_FK_1] FOREIGN KEY([city_id])
REFERENCES [dbo].[cities] ([id])
GO
ALTER TABLE [dbo].[zips] CHECK CONSTRAINT [zips_FK_1]
GO
/****** Object:  StoredProcedure [dbo].[1111_sp_business_partner_add]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111_sp_business_partner_add] (
@IDcompany int ,
@bp_desc nvarchar(100),
@supplier bit,
@customer bit
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN

if (ltrim(rtrim(@bp_desc)) != '')
begin
	insert into dbo.bp (IDcompany, [desc], supplier, customer) 
	select @IDcompany, @bp_desc, @supplier, @customer
end
end;
GO
/****** Object:  StoredProcedure [dbo].[1111_sp_business_partner_change_name]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111_sp_business_partner_change_name] (
@IDcompany int ,
@new_desc nvarchar(100),
@IDbp int
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
update dbo.bp 
set [desc] = @new_desc
where IDcompany = @IDcompany and IDbp = @IDbp
end;
GO
/****** Object:  StoredProcedure [dbo].[1111_sp_business_partner_enable_disable]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111_sp_business_partner_enable_disable] (
@IDcompany int ,
@IDbp int,
@function nvarchar (20),
@yesno bit
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
if ltrim(rtrim(@function)) = 'supplier'
begin
	update dbo.bp 
	set supplier = @yesno
	where IDcompany = @IDcompany and IDbp = @IDbp
end
if ltrim(rtrim(@function)) = 'customer'
begin
	update dbo.bp 
	set customer = @yesno
	where IDcompany = @IDcompany and IDbp = @IDbp
end
end;
GO
/****** Object:  StoredProcedure [dbo].[1111_sp_warehouse_add]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111_sp_warehouse_add] (
@IDcompany int ,
@country nvarchar(2),
@desc nvarchar(100)
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
declare @checkExist int = 0
/* Controllo che non esista già il magazzino inserito, se c'è non creo nulla */
select @checkExist = isnull(count([desc]),0)
from [dbo].[warehouse]  
where IDcompany = @IDcompany and IDcountry = @country and ltrim(rtrim([desc])) = ltrim(rtrim(@desc))
if @checkExist = 0
begin
		if (ltrim(rtrim(@desc)) != '')
		begin
			if (ltrim(rtrim(@country)) != '')
				begin
				insert into [dbo].[warehouse] (IDcompany, [desc], IDcountry) 
				select @IDcompany, @desc, @country

				declare @NewWarehouseId int = (select [IDwarehouse] from [dbo].[warehouse] where IDcompany = @IDcompany and IDcountry = @country and [desc] = @desc)
				/* 2020 02 22 Aggiungo in automatico alla creazione del magazzino anche l'ubicazione "Load" con il flag di DefaultLoadLocation, cioò l'ubicazione usata di 
				default in tutte quelle pagina che effettuano il carico (es: receipt_purchase, receipt_chiorino_lots ..) */
				insert into [dbo].[warehouse_location] (IDcompany, IDwarehouse, [desc], [note], DefaultLoadLocPerWh) 
				select @IDcompany, @NewWarehouseId, 'Load', 'Default loading location', 1
				end
		end

end
end;
GO
/****** Object:  StoredProcedure [dbo].[1111_sp_warehouse_location_add]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111_sp_warehouse_location_add] (
@IDcompany int ,
@warehouse nvarchar(2),
@NewLocDesc nvarchar(100),
@note nvarchar(100)
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
if (ltrim(rtrim(@warehouse)) != '')
begin
	if (ltrim(rtrim(@NewLocDesc)) != '')
	begin

	insert into [dbo].[warehouse_location](IDcompany, IDwarehouse , [desc], note) 
	select @IDcompany, @warehouse, @NewLocDesc, @note
	end
end
end;
GO
/****** Object:  StoredProcedure [dbo].[1111_sp_warehouse_location_update_type]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create PROCEDURE [dbo].[1111_sp_warehouse_location_update_type] (
@IDcompany int ,
@IDlocation int,
@IDwh_loc_Type int
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
update [dbo].[warehouse_location]
set IDwh_loc_Type = @IDwh_loc_Type
where @IDcompany = @IDcompany and IDlocation = @IDlocation
end;
GO
/****** Object:  StoredProcedure [dbo].[11111sp_material_transfer_add_lots_temp]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[11111sp_material_transfer_add_lots_temp] (@IDcomp int, @username nvarchar(35), @ArrayIDstock nvarchar(max))
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
declare @currentQty float = 0
declare @getdate DATETIME = getutcdate()
declare @NumberOfLotsToAdd int = (select COUNT(*) from [dbo].[Split_string_to_lots_table](@ArrayIDstock,','))
while @NumberOfLotsToAdd <>  0
Begin
		
		set @currentQty = (select sss.qty_stock from dbo.stock sss where sss.IDstock = 
						  (select [value] from [dbo].[Split_string_to_lots_table](@ArrayIDstock,',') where indice = @NumberOfLotsToAdd))
		insert into dbo.material_transfer_temp  (IDcompany, username, qty, [IDStock], date_ins)

		select IDcompany, username, currentQty, IDstock, @getdate
		from 
		(
			select @IDcomp as IDcompany, @username as username, @currentQty as currentQty,
			(select [value] from [dbo].[Split_string_to_lots_table](@ArrayIDstock,',') where indice = @NumberOfLotsToAdd) as IDstock
		) NewRecord
		/* Per evitare che inseriscano più volte lo stesso record */
		where IDstock not in (select ct.IDstock from material_transfer_temp ct where ct.IDcompany = @IDcomp and ct.username = @username)

		
		/* 2018 11 14 Aggiunta automatica di lotti STEP roll legati a lotti inseriti dall'utente */
		insert into dbo.material_transfer_temp  (IDcompany, username, qty, IDStock)
		
		/*
		select t.IDcompany, t.username, s.qty_stock, s.IDstock
		from dbo.material_transfer_temp t
		inner join dbo.stock s1 on s1.IDcompany = t.IDcompany and t.IDStock = s1.IDstock
		inner join dbo.lot l on l.IDcompany = t.IDcompany and s1.IDlot = l.IDlot
		inner join dbo.lot ldad on ldad.IDcompany = t.IDcompany and ldad.IDlot_padre = l.IDlot_padre  /* Questa join duplica per recuperare tutti i "fratelli" */
		inner join dbo.stock s on s.IDcompany = t.IDcompany and s.IDlot = ldad.IDlot
		where t.IDcompany = @IDcomp and username = @username
		and l.stepRoll = 1
		-- Per escludere i possibili "fratelli" già inseriti dagli utenti 
		and s.IDstock not in (select tt.IDStock from dbo.material_transfer_temp tt where tt.IDcompany = @IDcomp and tt.username = @username) */

		/*2020-06-15 Creata una nuova query per l'estrazione degli step roll, la precedente dava problemi nel caso
		della company USA in qui i lotti importati avevano il lotto padre settato a se stesso, questo tipo di estrazione è 
		presente anche su Cutting.php \ sql per trasferimento\ sql per spedizione(issue) */
		select l.IDcompany, @username, s.qty_stock, s.IDstock
		from dbo.stock s
		inner join dbo.lot l on s.IDcompany = l.IDcompany and s.IDlot = l.IDlot
		where l.IDlot_padre in
					/*Estraggo tutti i lotti padre dei lotti che sono presenti nel tabella transfer*/ 
					(select distinct				
							case when l.stepRoll = 1 then l.IDlot_padre
									  else 'ZZZZZZZZZZZZZ'end /* ID lotto padre fasullo per non estrarre nulla */
							/* 2020 10 22, esclusione dei lotti che vengono inseriti 
							da trasferire e che arrivano da commesse di taglio contenenti degli stepRoll ma che essi non lo sono, es :
							Lot1 StepRoll
							Lot2 StepRoll
							Lot3 Lotto normale, voglio spedire questo, non devo prendere i fratelli che sono step roll
							*/
					from dbo.material_transfer_temp t
					inner join dbo.stock s on s.IDcompany = t.IDcompany and t.IDStock = s.IDstock
					inner join dbo.lot l on l.IDcompany = t.IDcompany and s.IDlot = l.IDlot
					where t.IDcompany =  @IDcomp and username = @username)
		and s.IDcompany = @IDcomp
		and l.stepRoll = 1 
		-- Per escludere i possibili "fratelli" già inseriti dagli utenti 
		and s.IDstock not in (select tt.IDStock from dbo.material_transfer_temp tt where tt.IDcompany = @IDcomp)
		
		set @NumberOfLotsToAdd = @NumberOfLotsToAdd -1
end

end;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_cutting_order_delete_row]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_cutting_order_delete_row]

	@IDcompany [int],
	@IDlot [nvarchar](20),
	@IDcut [int]

AS

SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php

BEGIN


--eliminazione del taglio
/* L'id lotto è superfluo ... */
delete from dbo.cutting_order_row where IDcompany = @IDcompany and IDcut = @IDcut and IDlot = @IDlot


-- controllo se sono stati eliminati tutti i tagli, in tal caso cancelliamo anche la testata
declare @checkCutNum int = (select COUNT(*) from dbo.cutting_order_row where IDcompany = @IDcompany and IDlot = @IDlot)

if (@checkCutNum = 0)
begin
	delete from dbo.cutting_order where IDcompany = @IDcompany and IDlot = @IDlot 
end


END;

GO
/****** Object:  StoredProcedure [dbo].[1111sp_cutting_order_update_row]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_cutting_order_update_row]
	@IDcompany [int],
	@ArrayIDcut nvarchar(max),
	@ArrayLA nvarchar(max),
	@ArrayLU nvarchar(max),
	@ArrayPZ nvarchar(max),
	@MainLot nvarchar(20),
	@planned_date datetime
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/*
declare @IDcompany int = 845
declare @ArrayIDcut nvarchar(max) = '10297, 10329'
declare @ArrayLA nvarchar(max) = '300, 100'
declare @ArrayLU nvarchar(max) = '1250, 200'
declare @ArrayPZ nvarchar(max) = '1, 1' */
/* 2020-04-27 aggiornamento della data di esecuzione pianificata */
update dbo.cutting_order set date_planned = @planned_date where IDcompany = @IDcompany and IDlot = @MainLot
declare @NumberOfCutToUpdate int = (select COUNT(*) from [dbo].[Split_string_to_lots_table](@ArrayIDcut,'-'))
while @NumberOfCutToUpdate <>  0
Begin
	/* Se hanno messo a zero qualche valore non aggiorniamo i campi */
	if (cast((select value from [dbo].[Split_string_to_lots_table](@ArrayLA,'-') where indice = @NumberOfCutToUpdate) as float) <> 0 and
		cast((select value from [dbo].[Split_string_to_lots_table](@ArrayLU,'-') where indice = @NumberOfCutToUpdate) as float) <> 0 and
		cast((select value from [dbo].[Split_string_to_lots_table](@ArrayPZ,'-') where indice = @NumberOfCutToUpdate) as float) <> 0)
	begin
			update dbo.cutting_order_row
			set 
			LA = cast((select value from [dbo].[Split_string_to_lots_table](@ArrayLA,'-') where indice = @NumberOfCutToUpdate) as float),
			LU = cast((select value from [dbo].[Split_string_to_lots_table](@ArrayLU,'-') where indice = @NumberOfCutToUpdate) as float),
			PZ = cast((select value from [dbo].[Split_string_to_lots_table](@ArrayPZ,'-') where indice = @NumberOfCutToUpdate) as float)
			where 
			IDcut = (select value from [dbo].[Split_string_to_lots_table](@ArrayIDcut,'-') where indice = @NumberOfCutToUpdate)
			and IDcompany = @IDcompany 
	end
	set @NumberOfCutToUpdate = @NumberOfCutToUpdate - 1
end

END;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_inventory_add]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_inventory_add] (
@IDcompany int ,
@username nvarchar(35),
@desc nvarchar(100)
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
if (ltrim(rtrim(@desc)) != '')
begin
	insert into [dbo].[inventory](IDcompany, [desc], completed, [start_date], [end_date], username ) 
	select @IDcompany, @desc, 0, getutcdate(), 0, @username
end
end;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_inventory_add_lot]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_inventory_add_lot] (
@IDcompany int ,
@username nvarchar(35),
@IDlot nvarchar(20),
@IDwh int,
@IDwhl int,
@IDinv int
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN

update dbo.stock
set IDinventory = @IDinv, invUsername = @username, invDate_ins = getutcdate()
where IDcompany = @IDcompany and IDlot = @IDlot and IDwarehouse = @IDwh and IDlocation = @IDwhl

end;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_inventory_conclude]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_inventory_conclude] (
@IDcompany int ,
@invId  int
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/* Inserisco i lotti inventariati nello storico */
insert into dbo.inventory_lots_history
select s.IDcompany, s.IDinventory, s.IDlot, s.qty_stock, s.invUsername, s.invDate_ins, s.IDwarehouse, s.IDlocation
from dbo.stock s 
where s.IDcompany = @IDcompany and s.IDinventory = @invId
/* Pulisco la tabella dello stock dai dati dell'inventario */
update dbo.stock
set IDinventory = NULL, invUsername = NULL,  invDate_ins = NULL
where IDcompany = @IDcompany and IDinventory = @invId
/* Chiudo l'inventario */
update [dbo].[inventory]
set completed = 1, end_date = getutcdate()
where IDcompany = @IDcompany and IDinventory = @invId
end;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_inventory_del_lot]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_inventory_del_lot] (
@IDcompany int ,
@username nvarchar(35),
@IDlot nvarchar(20),
@IDwh int,
@IDwhl int,
@IDinv int
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN

update dbo.stock
set IDinventory = NULL, invUsername = NULL, invDate_ins = NULL
where IDcompany = @IDcompany and IDlot = @IDlot and IDwarehouse = @IDwh and IDlocation = @IDwhl

end;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_item_add]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_item_add] (
@IDcompany int ,
@item_desc nvarchar(100),
@um nvarchar(3),
@item_group nvarchar(10)
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/*2020-02-24, gli utenti non possono più inserire il codice articolo che ora è gestito dal sistema in base alla famiglia
articolo che ora è base company, e potranno quindi selezionare solo gruppi articolo della loro company */
/* Recupero il numero più alto usato per questa famiglia*/
declare @NewItemNumberCode int = isnull((
							select max(cast(replace(item,@item_group,'') as int)) 
							from item
							where IDcompany = @IDcompany
							and item_group = @item_group),'0')
/* Incremento di 1 per il nuovo articolo */
set @NewItemNumberCode = @NewItemNumberCode + 1
insert into item (item,item_desc,um,item_group, IDcompany)
select @item_group + cast(@NewItemNumberCode as nvarchar(max)), @item_desc, @um, @item_group, @IDcompany

declare @IDitem int = (select IDitem from item where IDcompany = @IDcompany and item = @item_group + cast(@NewItemNumberCode as nvarchar(max)))
/* 2023-01-28, AB, attiviamo automaticamente gli articoli che creano loro */
exec [dbo].[sp_item_enable_disable] @IDcompany, @IDitem, 1
end;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_item_enable_disable]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_item_enable_disable] (
@IDcompany int ,
@IDitem int,
@enable bit
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
if (@enable = 1) --attiviamo
begin
	insert into dbo.item_enabled select @IDcompany,  @IDitem, '', '' 
end
if (@enable = 0) --disattiviamo
begin
	delete from dbo.item_enabled where IDcompany = @IDcompany and IDitem = @IDitem
end

end;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_item_stock_limit_add]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_item_stock_limit_add] (
@IDcompany int,
@IDitem int,
@IDwarehouse int,
@qty_min float,
@qty_max float,
@username nvarchar(35)
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN

/* Inserisco il valore (questa tabella fa anche da storico, l'ultimo (base data) è quello effettivo) */
insert into dbo.item_stock_limits
select @IDcompany, @IDitem, @IDwarehouse, @qty_min, @qty_max, @username, getutcdate(), 1

end;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_item_update_alternative_code]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create PROCEDURE [dbo].[1111sp_item_update_alternative_code] (
@IDcompany int ,
@IDitem int,
@code nvarchar(47),
@desc nvarchar(100)
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
	update dbo.item_enabled 	
	set altv_code=@code,  altv_desc=@desc
	where IDcompany = @IDcompany and IDitem = @IDitem
end;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_lot_update_info]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_lot_update_info] (
@IDcompany int ,
@IDlot nvarchar (20),
@eur1 bit,
@date_lot datetime
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
update dbo.lot
set eur1 = @eur1,
	date_lot = @date_lot
where IDcompany = @IDcompany and IDlot = @IDlot
end;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_lot_update_text]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_lot_update_text] (
@IDcompany int ,
@IDlot nvarchar (20),
@note nvarchar (200),
@ord_ref nvarchar (100)
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
update dbo.lot
set note = @note,
    ord_rif = @ord_ref
where IDcompany = @IDcompany and IDlot = @IDlot
end;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_lot_values_add]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_lot_values_add]
	@IDcompany [int],
	@username nvarchar(35),
	@ArrayIdLots nvarchar(max),
	@ArrayValues nvarchar(max)
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/*
2020 04 20, AB, questa SP richiavama più volta la sp_lot_value_add per aggiungere automaticamente più valori
*/
declare @NumberOfIdLots int = (select COUNT(*) from [dbo].[Split_string_to_lots_table](@ArrayIdLots,'-'))
declare @CurrIDlot nvarchar(20) = ''
declare @CurrValue float = 0
while @NumberOfIdLots <>  0
Begin
	set @CurrIDlot = ''
	set @CurrValue = 0
	
	set @CurrIDlot = ltrim(rtrim((select value from [dbo].[Split_string_to_lots_table](@ArrayIdLots,'-') where indice = @NumberOfIdLots)))
	set @CurrValue = (select value from [dbo].[Split_string_to_lots_table](@ArrayValues,'-') where indice = @NumberOfIdLots)
	/* Se non hanno messo un valore al lotto lo skippiamo, per settare il valore a zero abbiamo messo una funzione
	appositva sulla pagina web */
	if (@CurrValue <> 0 )
	begin			
			exec dbo.sp_lot_value_add @IDcompany, @CurrIDlot, @CurrValue, @username, 1, ''
	end
	set @NumberOfIdLots = @NumberOfIdLots - 1
end

END;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_material_issue_add_lots_temp]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_material_issue_add_lots_temp] (@IDcomp int, @username nvarchar(35), @ArrayIDstock nvarchar(max))
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
declare @currentQty float = 0
declare @getdate DATETIME = getutcdate()
declare @NumberOfLotsToAdd int = (select COUNT(*) from [dbo].[Split_string_to_lots_table](@ArrayIDstock,','))
while @NumberOfLotsToAdd <>  0
Begin
		
		set @currentQty = (select sss.qty_stock from dbo.stock sss where sss.IDstock = 
						  (select [value] from [dbo].[Split_string_to_lots_table](@ArrayIDstock,',') where indice = @NumberOfLotsToAdd))
		insert into dbo.material_issue_temp  (IDcompany, username, qty, [IDStock], date_ins)

		select IDcompany, username, currentQty, IDstock, @getdate
		from 
		(
			select @IDcomp as IDcompany, @username as username, @currentQty as currentQty,
			(select [value] from [dbo].[Split_string_to_lots_table](@ArrayIDstock,',') where indice = @NumberOfLotsToAdd) as IDstock
		) NewRecord
		/* Per evitare che inseriscano più volte lo stesso record */
		where IDstock not in (select ct.IDstock from material_issue_temp ct where ct.IDcompany = @IDcomp and ct.username = @username)

		
		/* 2018 11 14 Aggiunta automatica di lotti STEP roll legati a lotti inseriti dall'utente */
		insert into dbo.material_issue_temp  (IDcompany, username, qty, IDStock)
		
		/*
		select t.IDcompany, t.username, s.qty_stock, s.IDstock
		from dbo.material_issue_temp t
		inner join dbo.stock s1 on s1.IDcompany = t.IDcompany and t.IDStock = s1.IDstock
		inner join dbo.lot l on l.IDcompany = t.IDcompany and s1.IDlot = l.IDlot
		inner join dbo.lot ldad on ldad.IDcompany = t.IDcompany and ldad.IDlot_padre = l.IDlot_padre  /* Questa join duplica per recuperare tutti i "fratelli" */
		inner join dbo.stock s on s.IDcompany = t.IDcompany and s.IDlot = ldad.IDlot
		where t.IDcompany = @IDcomp and username = @username
		and l.stepRoll = 1
		-- Per escludere i possibili "fratelli" già inseriti dagli utenti 
		and s.IDstock not in (select tt.IDStock from dbo.material_issue_temp tt where tt.IDcompany = @IDcomp and tt.username = @username) */
		/*2020-06-15 Creata una nuova query per l'estrazione degli step roll, la precedente dava problemi nel caso
		della company USA in qui i lotti importati avevano il lotto padre settato a se stesso, questo tipo di estrazione è 
		presente anche su Cutting.php \ sql per trasferimento\ sql per spedizione(issue) */
		select l.IDcompany, @username, s.qty_stock, s.IDstock
		from dbo.stock s
		inner join dbo.lot l on s.IDcompany = l.IDcompany and s.IDlot = l.IDlot
		where l.IDlot_padre in
					/*Estraggo tutti i lotti padre dei lotti che sono presenti nel tabella transfer*/ 
					(select distinct				
							case when l.stepRoll = 1 then l.IDlot_padre
									  else 'ZZZZZZZZZZZZZ'end /* ID lotto padre fasullo per non estrarre nulla */
							/* 2020 10 22, esclusione dei lotti che vengono inseriti 
							da trasferire e che arrivano da commesse di taglio contenenti degli stepRoll ma che essi non lo sono, es :
							Lot1 StepRoll
							Lot2 StepRoll
							Lot3 Lotto normale, voglio spedire questo, non devo prendere i fratelli che sono step roll
							*/
					from dbo.material_issue_temp t
					inner join dbo.stock s on s.IDcompany = t.IDcompany and t.IDStock = s.IDstock
					inner join dbo.lot l on l.IDcompany = t.IDcompany and s.IDlot = l.IDlot
					where t.IDcompany =  @IDcomp and username = @username)
		and s.IDcompany = @IDcomp
		and l.stepRoll = 1 
		-- Per escludere i possibili "fratelli" già inseriti dagli utenti 
		and s.IDstock not in (select tt.IDStock from dbo.material_issue_temp tt where tt.IDcompany = @IDcomp)
		
		set @NumberOfLotsToAdd = @NumberOfLotsToAdd -1
end
end;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_material_issue_change_qty_temp_row]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_material_issue_change_qty_temp_row] (@IDcomp int, @IDuser nvarchar(35), @NewQty float, @IDissue int)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/* 
Questa funzione server per aggiornare la quantità da consumare solo per gli articoli frazionabili 
Sul form c'è il controllo che la quantità non sia minore o = 0, qui controlliamo che la qty inserita non sia maggiore di quella a magazzino
includendo anche l'ubicazione in quanto lo stesso lotto può essere su mag\ubi diverse
*/
declare @qtyMag float = (select sum(qty_stock)
						 from stock s
						 inner join material_issue_temp t on s.IDcompany = t.IDcompany and s.IDstock = t.IDStock 
						 where s.IDcompany = @IDcomp and username = @IDuser and IDissue = @IDissue)
if @qtyMag < @NewQty		/* Check qty a magazzino, se quella inserita è maggiore di quella a magazzino mettiamo la new = a quella presente a magazzino */
begin
	set @NewQty = @qtyMag
end
	update dbo.material_issue_temp
	set qty = @NewQty
	where IDcompany = @IDcomp and username = @IDuser and IDissue = @IDissue
end;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_material_issue_confirm]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_material_issue_confirm] (@IDcompany int, @username nvarchar(35), @RefOrder nvarchar(100), @IDcustomer int, @IDdestination int,
												   @delivery_note [nvarchar](200)  /*2021-04-06*/)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/* 
 - Questa funzione conferma tutti i lotti da "spedire", cioò li "consuma\scarica" dal magazzino 
 - Ogni utente può fare una singola spedizione per volta, quindi la conferma funziona in base utente
*/
--1 cancellazione o diminuzione dello stock 
--2 scrittura della transazione 
--3 eliminazione dei record sulla material_issue_temp
declare @numer_of_lots int = (select COUNT(*) 
							  from dbo.material_issue_temp tt
							  /*2020 04 07, aggiunta inner con stock come dentro il "while", problema record duplicati in caso di idstock non più validi perchè spostati da altri ustenti.*/
							  inner join dbo.stock sss on sss.IDcompany = tt.IDcompany and tt.IDStock = sss.IDStock 																																
							  where tt.IDcompany = @IDcompany and tt.username = @username) -- leggo il numero lotti da consumare
declare @currentIssue int = 0 
declare @currentLot nvarchar (20) = ''
declare @currentWh int = 0
declare @currentLoc int = 0
declare @currentQty float = 0
declare @currentUM nvarchar (3) = ''
-- cicli per ogni taglio inserito
while @numer_of_lots > 0
Begin
	/*2020 04 07, inizializzazione variabili, problema record duplicati in caso di idstock non più validi perchè 
	spostati da altri ustenti.*/
	set @currentIssue = 0 
	set @currentLot = ''
	set @currentWh = 0
	set @currentLoc = 0
	set @currentQty = 0
	set @currentUM = ''
	/* Seleziono il primo record che poi andò ad eliminare a fine di ogni ciclo per passare al successivo */
	select top 1 @currentIssue = IDissue, @currentLot = ss.IDlot, @currentWh = ss.IDwarehouse, @currentLoc = ss.IDlocation, @currentQty = qty
	from dbo.material_issue_temp t
	inner join dbo.stock ss on ss.IDcompany = t.IDcompany and t.IDStock = ss.IDStock
	where t.IDcompany = @IDcompany and username = @username
	if @currentLot <> '' begin /* 2020 04 07, se non riesco a leggere il lotto non faccio nulla */
		
		set @currentUM = (select um from item i inner join lot l on i.IDitem = l.IDitem where l.IDlot = @currentLot)
		/* Eliminazione\consumo dallo stock e scrittura del log nelle transazioni */
		exec dbo.sp_main_stock_transaction @IDcompany, @currentLot, @currentWh, @currentLoc, @currentUM,'-', @currentQty, 3, @username, @RefOrder, @IDcustomer,0
		/* Cancelliamo dalla tabella temporanea il record proceassato */
		delete from dbo.material_issue_temp where IDcompany = @IDcompany and username = @username and IDissue = @currentIssue
	
		/* 2020 02 04, aggiunta tabella shipment con destinazione bp */
		exec dbo.sp_shipment_add @IDcompany, @currentLot, @currentQty, @IDcustomer, @IDdestination, @delivery_note
		set @numer_of_lots = @numer_of_lots - 1
	end
	
end
end;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_material_issue_delete_temp_row]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_material_issue_delete_temp_row]
	@IDcompany [int],
	@user nvarchar(35),
	@IDissue [int]
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/* Salvo il lotto per l'eliminazione automatica degli step roll */
declare @stepRollLot nvarchar(20) = (select IDlot 
									from dbo.material_issue_temp t
									inner join dbo.stock ss on ss.IDcompany = t.IDcompany and t.IDStock = ss.IDstock
									where t.IDcompany = @IDcompany and IDissue = @IDissue and username = @user)
--eliminazione del taglio
/* L'utente dovrebbe essere superfluo ... */
delete from dbo.material_issue_temp where IDcompany = @IDcompany and IDissue = @IDissue and username = @user

/* 2018 11 14 Eliminazione automatica di lotti STEP roll legati al lotto eliminato dall'utente,
gli step roll sono esclusivamente relativi a materiali non divisibili, quindi non necessata fare ulteriori controlli */
delete from dbo.material_issue_temp where IDcompany = @IDcompany and username = @user and IDissue in 
(
select IDissue 
from dbo.material_issue_temp t
inner join dbo.stock sss on sss.IDcompany = t.IDcompany and sss.IDstock = t.IDStock
inner join lot l on l.IDcompany = t.IDcompany and sss.IDlot = l.IDlot
where t.IDcompany = @IDcompany and username = @user 
and l.IDlot_padre = (select IDlot_padre from dbo.lot where IDcompany = @IDcompany and IDlot = @stepRollLot)
and l.stepRoll = 1   /* Attenzione, ci sono i resi che hanno lo stesso padre ma che non sono step roll */
)

END;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_material_transfer_change_qty_temp_row]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_material_transfer_change_qty_temp_row] (@IDcomp int, @IDuser nvarchar(35), @NewQty float, @IDtrans int)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/* 
Questa funzione serve per aggiornare la quantità da trasferire solo per gli articoli frazionabili 
Sul form c'è il controllo che la quantità non sia minore o = 0, qui controlliamo che la qty inserita non sia maggiore di quella a magazzino
*/
declare @qtyMag float = (select sum(qty_stock)
						 from stock s
						 inner join material_transfer_temp t on s.IDcompany = t.IDcompany and s.IDstock = t.IDStock 
						 where s.IDcompany = @IDcomp and username = @IDuser and IDtrans = @IDtrans)
if @qtyMag < @NewQty		/* Check qty a magazzino, se quella inserita è maggiore di quella a magazzino mettiamo la new = a quella presente a magazzino */
begin
	set @NewQty = @qtyMag
end
	update dbo.material_transfer_temp
	set qty = @NewQty
	where IDcompany = @IDcomp and username = @IDuser and IDtrans = @IDtrans
end;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_material_transfer_confirm]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_material_transfer_confirm] (@IDcompany int, @username nvarchar(35), @IDmagDest int, @IDlocDest int)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/* 
 - Questa funzione conferma tutti i lotti da "trasferire", cioò fa - dal magazzino di partenza e + nella destinazione
 - Ogni utente può fare un singolo trasferimento per volta (con N righe), quindi la conferma funziona in base utente
*/
--1 meno sul magazzino di origine, più sul magazzino di destinazione
--2 eliminazione dei record sulla material_issue_temp
declare @numer_of_lots int = (select COUNT(*) 
							  from dbo.material_transfer_temp tt
							  /*2020 04 07, aggiunta inner con stock come dentro il "while", problema record duplicati in caso di idstock non più validi perchè spostati da altri ustenti.*/
							  inner join dbo.stock sss on sss.IDcompany = tt.IDcompany and tt.IDStock = sss.IDStock 																																
							  where tt.IDcompany = @IDcompany and tt.username = @username) -- leggo il numero lotti da consumare
declare @currentTrans int = 0 
declare @currentLot nvarchar (20) = ''
declare @currentWh int = 0
declare @currentLoc int = 0
declare @currentQty float = 0
declare @currentUM nvarchar (3) = ''
-- cicli per ogni taglio inserito
while @numer_of_lots >  0
Begin
	/*2020 04 07, inizializzazione variabili, problema record duplicati in caso di idstock non più validi perchè 
	spostati da altri ustenti.*/
	set @currentTrans = 0 
	set @currentLot = ''
	set @currentWh = 0
	set @currentLoc = 0
	set @currentQty = 0
	set @currentUM = ''

	/* Seleziono il primo record che poi andò ad eliminare a fine di ogni ciclo per passare al successivo */
	select top 1 @currentTrans = IDtrans, @currentLot = ss.IDlot, @currentWh = ss.IDwarehouse, @currentLoc = ss.IDlocation, @currentQty = t.qty
	from dbo.material_transfer_temp t
	inner join dbo.stock ss on ss.IDcompany = t.IDcompany and t.IDStock = ss.IDStock
	where t.IDcompany = @IDcompany and t.username = @username
	if @currentLot <> '' begin /* 2020 04 07, se non riesco a leggere il lotto non faccio nulla */
		
		set @currentUM = (select um from item i inner join lot l on i.IDitem = l.IDitem where l.IDlot = @currentLot)
		/* Eliminazione\consumo dallo stock e scrittura del log nelle transazioni */
		exec dbo.sp_main_stock_transaction @IDcompany, @currentLot, @currentWh, @currentLoc, @currentUM,'-', @currentQty, 5, @username, '', 0,0
		/* Caricamento a magazzino del lotto trasferito e scrittura del log nelle transazioni */
		exec dbo.sp_main_stock_transaction @IDcompany, @currentLot, @IDmagDest, @IDlocDest, @currentUM,'+', @currentQty, 5, @username, '', 0,0

		/* Cancelliamo dalla tabella temporanea il record proceassato */
		delete from dbo.material_transfer_temp where IDcompany = @IDcompany and username = @username and IDtrans = @currentTrans
	
		set @numer_of_lots = @numer_of_lots - 1
	end
end
end;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_material_transfer_delete_temp_row]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_material_transfer_delete_temp_row]
	@IDcompany [int],
	@user nvarchar(35),
	@IDtrans [int]
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/* Salvo il lotto per l'eliminazione automatica degli step roll */
declare @stepRollLot nvarchar(20) = 
(select ss.IDlot 
from dbo.material_transfer_temp t
inner join dbo.stock ss on ss.IDcompany = t.IDcompany and t.IDStock = ss.IDstock
where t.IDcompany = @IDcompany and IDtrans = @IDtrans and username = @user)
--eliminazione del taglio
/* L'utente dovrebbe essere superfluo ... */
delete from dbo.material_transfer_temp where IDcompany = @IDcompany and IDtrans = @IDtrans and username = @user

/* 2018 11 14 Eliminazione automatica di lotti STEP roll legati al lotto eliminato dall'utente,
gli step roll sono esclusivamente relativi a materiali non divisibili, quindi non necessata fare ulteriori controlli */
delete from dbo.material_transfer_temp where IDcompany = @IDcompany and username = @user and IDtrans in 
(
select IDtrans 
from dbo.material_transfer_temp t
inner join dbo.stock sss on sss.IDcompany = t.IDcompany and sss.IDstock = t.IDStock
inner join lot l on l.IDcompany = t.IDcompany and sss.IDlot = l.IDlot
where t.IDcompany = @IDcompany and username = @user 
and l.IDlot_padre = (select IDlot_padre from dbo.lot where IDcompany = @IDcompany and IDlot = @stepRollLot)
and l.stepRoll = 1   /* Attenzione, ci sono i resi che hanno lo stesso padre ma che non sono step roll */
)

END;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_order_production_del_component]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_order_production_del_component]
	@IDcompany [int],
	@IDcomp [int]
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN

declare @IDord int = (select top 1 IDord from dbo.[order_production_components] where IDcompany = @IDcompany and IDcomp = @IDcomp)

delete from [dbo].[order_production_components] where IDcompany = @IDcompany and IDcomp = @IDcomp

-- controllo se sono stati eliminati tutti i componenti, in tal caso cancelliamo anche la testata
declare @checkCompNum int = (select COUNT(*) from dbo.[order_production_components] where IDcompany = @IDcompany and IDord = @IDord)
if (@checkCompNum = 0)
begin
	delete from dbo.order_production where IDcompany = @IDcompany and IDord = @IDord
end

END;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_order_production_update_component_row]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_order_production_update_component_row]
	@IDcompany [int],
	@ArrayIdComp nvarchar(max),
	@ArrayMethod nvarchar(max),
	@ArrayIDstock nvarchar(max),
	@ArrayQty nvarchar(max),
	@IDlot nvarchar(20)
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN

declare @IDord bigint = (select IDord from dbo.order_production o where o.IDcompany = @IDcompany and o.IDlot = @IDlot)
declare @NumberOfCompToUpdate int = (select COUNT(*) from [dbo].[Split_string_to_lots_table](@ArrayIdComp,'-'))
while @NumberOfCompToUpdate <>  0
Begin
			/* 2020 04 03, recupero info da IDstock */
			declare @CompUM nvarchar(3) = ''
			declare @CompQty float = 0
			select @CompUM = i.um, @CompQty = s.qty_stock
			from dbo.stock s
			inner join dbo.lot l on l.IDcompany = s.IDcompany and s.IDlot = l.IDlot
			inner join dbo.item i on i.IDitem = l.IDitem
			where IDstock = (select value from [dbo].[Split_string_to_lots_table](@ArrayIDstock,'-') where indice = @NumberOfCompToUpdate)

			update dbo.order_production_components
			set 
			auto_lot = (select rtrim(ltrim(value)) from [dbo].[Split_string_to_lots_table](@ArrayMethod,'-') where indice = @NumberOfCompToUpdate),
			IDStock  = (select value from [dbo].[Split_string_to_lots_table](@ArrayIDstock,'-') where indice = @NumberOfCompToUpdate),
			/* 2020 04 03, se l'UM è m2 ed è presente il lotto mettiamo la qty del lotto\mag\loc che è stato inserito */
			qty      = case when @CompUM = 'm2' then isnull(@CompQty,0) 
												else (select value from [dbo].[Split_string_to_lots_table](@ArrayQty,'-') where indice = @NumberOfCompToUpdate) end,
			/* 2020 04 03, L'IDlot è imporatante, perchè l'idstock si "perde" quando la giacenza viene consumata del tutto */
			IDlot	 = isnull(
							  (select IDlot from dbo.stock where IDstock = (select value from [dbo].[Split_string_to_lots_table](@ArrayIDstock,'-') where indice = @NumberOfCompToUpdate))
							  ,'')
			where 
			IDcomp = (select value from [dbo].[Split_string_to_lots_table](@ArrayIdComp,'-') where indice = @NumberOfCompToUpdate)
			and IDcompany = @IDcompany 
			and executed = 0 /* I record eseguiti non li aggiorniamo (gli input field disabilitati non vengono valorizzati correttamente )*/
	--end
	set @NumberOfCompToUpdate = @NumberOfCompToUpdate - 1
end

/* Tutti i record che hanno come metodo di prelievo l'automatico cancelliamo l'id stock da prelevare e il lotto */
update dbo.order_production_components
set IDStock = 0, IDlot = ''
where IDcompany = @IDcompany and IDord = @IDord and auto_lot = 1

END;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_order_split_del_row]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_order_split_del_row]
	@IDcompany [int],
	@IDsplit bigint
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN

declare @IDord int = (select top 1 IDord from dbo.[order_split_row] where IDcompany = @IDcompany and IDRowSplit = @IDsplit)

delete from [dbo].[order_split_row] where IDcompany = @IDcompany and IDRowSplit = @IDsplit

-- controllo se sono stati eliminati tutti i componenti, in tal caso cancelliamo anche la testata
declare @checkCompNum int = (select COUNT(*) from dbo.[order_split_row] where IDcompany = @IDcompany and IDord = @IDord)
if (@checkCompNum = 0)
begin
	delete from dbo.order_split where IDcompany = @IDcompany and IDord = @IDord
end

END;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_order_split_insert_row]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_order_split_insert_row]
	@IDcompany [int],	
	@IDstock bigint,			/* Questi ordini vengono eseguiti su lotti frazionabili, è quindi necessario specificare il record */		
	@qty [float],				/* Quella che è da "tagliare" */
	@ord_rif nvarchar (100) ,
	@username nvarchar (35),
	@location int				/* Il magazzino rimane quello del padrea */
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
declare @qty_dad float = 0
declare @IDord bigint = 0
declare @IDlot [nvarchar](20) = ''
declare @getdate DATETIME = getutcdate()
declare @IDwarehouse int = 0
declare @IDlocation int = 0
-- controllo se c'è già una testata per questa commessase non c'è la creo
declare @checkHeader int = (select count(IDord) from [dbo].[order_split] where IDcompany = @IDcompany and IDstock = @IDstock)
if (@checkHeader = 0)
begin
	select @qty_dad = qty_stock, @IDlot = IDlot, @IDwarehouse = IDwarehouse, @IDlocation = IDlocation from dbo.stock where IDcompany = @IDcompany and IDstock = @IDstock
	insert into [dbo].[order_split] (IDcompany,IDlot,IDstock,IDwarehouse,IDlocation,qty_ori,username, date_creation) values (@IDcompany,@IDlot,@IDstock, @IDwarehouse,@IDlocation,@qty_dad,@username,@getdate)	
end
set @IDord = (select IDord from [dbo].[order_split] where IDcompany = @IDcompany and IDstock = @IDstock )
--inserimento del taglio
insert into [dbo].[order_split_row] (IDcompany,IDord, qty_split, ord_ref, IDlocation) values 
(@IDcompany,@IDord,@qty,@ord_rif,@location)

END;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_shipment_add]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[1111sp_shipment_add] (
@IDcompany int ,
@IDlot [nvarchar](20),
@qty [float], 
@IDbp [int] ,
@IDdestination [int],
@delivery_note [nvarchar](200)  /*2021-04-06*/	
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/* 2020/02/04 aggiunta la tabella shipment, "estensione" delle transazioni in qunto la maggioranza delle transazioni
non ha spedizioni. 
In futuro questa tabella potrà contenere informazioni aggiuntive relative alle spedizioni 
Nota: questa sp viene eseguita dalla "sp_material_issue_confirm" */
declare @getdate DATETIME = getutcdate()
insert into [dbo].[shipments] (IDcompany, date_ship, IDlot, qty, IDbp, IDdestination, [delivery_note])
select @IDcompany, @getdate, @IDlot, @qty, @IDbp, @IDdestination, @delivery_note
end;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_user_update_regional_settings]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create PROCEDURE [dbo].[1111sp_user_update_regional_settings] (
@username nvarchar(35),
@dec nvarchar(1),
@sep nvarchar(1)
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
update dbo.users set [decimal_symb] = @dec, [list_separator] = @sep where username = @username
end;
GO
/****** Object:  StoredProcedure [dbo].[1111sp_user_update_timezone]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create PROCEDURE [dbo].[1111sp_user_update_timezone] (
@username nvarchar(35),
@timezone nvarchar(199)
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
update dbo.users set clientTimezoneDB = @timezone where username = @username
end;
GO
/****** Object:  StoredProcedure [dbo].[next_table_id]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[next_table_id]
@companyId INT, 
@tableName NVARCHAR(max),
@ret NVARCHAR(200) OUTPUT,
@inc int=null OUTPUT
AS 
BEGIN
	DECLARE @next INT = NULL
	DECLARE @sess_id_key NVARCHAR(MAX) = CONCAT('last-inserted-id-', @tableName)
	BEGIN TRANSACTION
	SELECT @next = [current] FROM table_sequences ts WITH (UPDLOCK, HOLDLOCK) WHERE company_id = @companyId AND table_name = @tableName
	IF @next IS NULL
		BEGIN
			INSERT INTO table_sequences VALUES (@companyId, @tableName, 1)
			SET @next = 1
		END
	ELSE
		BEGIN 
			SET @next = @next + 1
			UPDATE table_sequences SET [current] = @next WHERE company_id = @companyId AND table_name = @tableName
		END
	
	--DROP TABLE IF EXISTS ##session_ids
	--SELECT * INTO ##session_ids FROM (SELECT @@SPID AS session_id, @tableName AS table_name, @next AS [current]) c
	
	SET @ret = CONCAT(CONVERT(NVARCHAR(200), @companyId), '-', CONVERT(NVARCHAR(200), @next))
	SET @inc = @next
	EXEC sys.sp_set_session_context @sess_id_key, @ret;  
	COMMIT
END
GO
/****** Object:  StoredProcedure [dbo].[reset_company_data]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

        
        CREATE   PROCEDURE [dbo].[reset_company_data] (@idCompany int)
        AS 

        BEGIN
            BEGIN TRY
                BEGIN TRANSACTION; 
                

                delete from test_import.dbo.table_sequences where company_id = @idCompany;  

                 

                EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT all';

                    IF(@idCompany = 0)
                    BEGIN
                        DELETE FROM test_import.dbo.temp_item_id;
                    END
            
                    DELETE FROM test_import.dbo.company where IDcompany = @idCompany;

DELETE FROM test_import.dbo.warehouse where IDcompany = @idCompany;

DELETE FROM test_import.dbo.warehouse_location where IDcompany = @idCompany;

DELETE FROM test_import.dbo.warehouse_location_type;

DELETE FROM test_import.dbo.WAC_year_layers where IDcompany = @idCompany;

DELETE FROM test_import.dbo.WAC_year_layers_item_detail where IDcompany = @idCompany;

DELETE FROM test_import.dbo.adjustments_history where IDcompany = @idCompany;

DELETE FROM test_import.dbo.adjustments_type;

DELETE FROM test_import.dbo.bp where IDcompany = @idCompany;

DELETE FROM test_import.dbo.bp_destinations where IDcompany = @idCompany;

DELETE FROM test_import.dbo.country where IDcompany = @idCompany;

DELETE FROM test_import.dbo.cutting_order where IDcompany = @idCompany;

DELETE FROM test_import.dbo.cutting_order_row where IDcompany = @idCompany;

DELETE FROM test_import.dbo.devaluation_history where IDcompany = @idCompany;

DELETE FROM test_import.dbo.inventory where IDcompany = @idCompany;

DELETE FROM test_import.dbo.inventory_lots_history where IDcompany = @idCompany;

DELETE FROM test_import.dbo.item where IDcompany = @idCompany;

DELETE FROM test_import.dbo.item_enabled where IDcompany = @idCompany;

DELETE FROM test_import.dbo.item_group where IDcompany = @idCompany;

DELETE FROM test_import.dbo.item_stock_limits where IDcompany = @idCompany;

DELETE FROM test_import.dbo.logs where IDcompany = @idCompany;

DELETE FROM test_import.dbo.lot where IDcompany = @idCompany;

DELETE FROM test_import.dbo.lot_dimension where IDcompany = @idCompany;

DELETE FROM test_import.dbo.lot_numeri_primi where IDcompany = @idCompany;

DELETE FROM test_import.dbo.lot_type where IDcompany = @idCompany;

DELETE FROM test_import.dbo.lot_value where IDcompany = @idCompany;

DELETE FROM test_import.dbo.material_issue_temp where IDcompany = @idCompany;

DELETE FROM test_import.dbo.material_transfer_temp where IDcompany = @idCompany;

DELETE FROM test_import.dbo.stock where IDcompany = @idCompany;

DELETE FROM test_import.dbo.transactions where IDcompany = @idCompany;

DELETE FROM test_import.dbo.transactions_type;

DELETE FROM test_import.dbo.order_production where IDcompany = @idCompany;

DELETE FROM test_import.dbo.order_production_components where IDcompany = @idCompany;

DELETE FROM test_import.dbo.order_split where IDcompany = @idCompany;

DELETE FROM test_import.dbo.order_split_row where IDcompany = @idCompany;

DELETE FROM test_import.dbo.receptions where IDcompany = @idCompany;

DELETE FROM test_import.dbo.shipments where IDcompany = @idCompany;

DELETE FROM test_import.dbo.um;

DELETE FROM test_import.dbo.um_dimension;


            EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT all';


            
            COMMIT;
        

        END TRY
        BEGIN CATCH
            ROLLBACK;
            EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT all';



          

            SELECT
    ERROR_NUMBER() AS ErrorNumber,
    ERROR_STATE() AS ErrorState,
    ERROR_SEVERITY() AS ErrorSeverity,
    ERROR_PROCEDURE() AS ErrorProcedure,
    ERROR_LINE() AS ErrorLine,
    ERROR_MESSAGE() AS ErrorMessage;
        END CATCH
        END;
GO
/****** Object:  StoredProcedure [dbo].[sp_adjustments_add_new_lots]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_adjustments_add_new_lots]
	@IDcompany [int],
	@Dadlot nvarchar (20),
	@mag nvarchar (max),
	@loc nvarchar (max),	
	@DE [float],
	@DI [float],
	@LA [float], 
	@LU [float],
	@PZ [float],	
	@username [nvarchar] (35),	
	@IDadjtype int,
	@um [nvarchar] (5),
	@IDitem nvarchar (max),
	@lotText nvarchar(200),
	@eur1 bit, /* 2020 04 02 */
	@conf_item bit, /* 2023 01 02 */
	@merged_lot bit /* 2023 02 28 */
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/*
NOTE GENERALI:
- Non diamo la possibilità di modificare le dimensioni di un lotto, in caso di dimensioni errate la rettifica consuma
il lotto e ne versa un'altro con le dimensioni corrette.

*/
declare @NuovoLotto [nvarchar] (20)
declare @getdate DATETIME = getutcdate()
declare @qty float = 0
/* Generazione codice lotto in base i dati passati (logica di generazione presente sulla vista */
/* AB, 2018 10 29 utilizzo dell'sp che salva i numeri primi
set @NuovoLotto = (select gen_cod_lot.lot_code + gen_cod_lot.IDcountry + gen_cod_lot.IDlotType + gen_cod_lot.year_number + gen_cod_lot.seriale
				   from dbo.vw_GeneraCodiciLottoPerCompany gen_cod_lot
				   inner join dbo.warehouse wh on wh.IDcompany = gen_cod_lot.IDcompany and wh.IDcountry = gen_cod_lot.IDcountry
				   where gen_cod_lot.IDcompany = @IDcompany 
				   and   IDlotType = 'A' 
				   and   wh.IDwarehouse = @mag) */ 
 declare @NEW_lotCode nvarchar(20)
 exec sp_generateNewLotCode @IDcompany,@mag,'A', @NEW_lotCode OUTPUT
 select @NuovoLotto = @NEW_lotCode 
  /* Lettura di alcune info dal possibile lotto passato, se NON LO PASSO NON LI USO */
 declare @dad_orig nvarchar (20) = ''
 declare @dad_date datetime
 declare @dad_checked_value bit 
 declare @dad_devaluation int
 declare @dad_ord_rif nvarchar(100) = ''
 declare @dad_checked_value_date DATETIME
 if (ltrim(rtrim(@Dadlot)) = '')
 begin
	set @dad_orig = @NuovoLotto
	set @dad_date = @getdate
	set @dad_checked_value = 0
	set @dad_devaluation = 0
end
else
begin
	select @dad_date = ld.date_lot, @dad_orig = ld.IDlot_origine, --,@str_order = ld.step_roll_order, @str = ld.stepRoll
	@dad_checked_value = ld.checked_value, @dad_devaluation = ld.devaluation, @dad_ord_rif = ld.ord_rif, @dad_checked_value_date = checked_value_date
	from lot ld
	where ld.IDcompany = IDcompany and ld.IDlot = @Dadlot
end
/* Inserimento lotto in anagrafica lotti */
exec dbo.sp_lotInserimento @IDcompany, @NuovoLotto, @IDitem, @getdate, @dad_date, @NuovoLotto, @dad_orig, '', NULL, @lotText, 0,0, @DE,@DI,@LA,@LU,@PZ, 
@dad_checked_value, @dad_devaluation, @dad_ord_rif, @dad_checked_value_date, @eur1, @conf_item, @merged_lot, 4, 0
/* Calclo delle qty in base all'um di gestione magazzino */
set @qty = dbo.calcQtyFromDimensionByUM(@um, @LA,@LU,@PZ,@DI,@DE)
/* Essendo una rettifica che inserisce un nuovo lotto lo mettiamo a zero e dovrà essere controllato*/
exec dbo.sp_lot_value_add @IDcompany, @NuovoLotto, 0, @username, 0, 'Adjustment: added lot'
-- Inserimento lotto in stock e nelle transazioni 
exec dbo.sp_main_stock_transaction @IDcompany, @NuovoLotto, @mag, @loc, @um,'+', @qty, 4, @username, '', null, null
/* Nel caso in cui la rettifica è con causale "inventario" riportiamo anche l'id dell'inventario attivo 
(è possibile avere un solo inventario attivo per company) */
declare @IDinventory int = dbo.getActiveInventoryId(@IDcompany, @IDadjtype)
-- Scrittura log nello storico delle rettifiche
insert into dbo.adjustments_history([IDcompany], [date_adj],[IDlot],[IDwarehouse],[IDlocation],[segno],[qty],[IDadjtype],IDinventory, [username])
select @IDcompany,@getdate,@NuovoLotto,@mag,@loc,'+',@qty,@IDadjtype, @IDinventory, @username
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_adjustments_erase_add_lots]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_adjustments_erase_add_lots]
	@IDcompany [int],
	@IDlot nvarchar (20),
	@mag nvarchar (max),
	@loc nvarchar (max),
	@DE [float],
	@DI [float],
	@LA [float], 
	@LU [float],
	@PZ [float],
	@QTY_requested [float],	
	@username [nvarchar] (35),
	@IDadjtype int,
	@um [nvarchar] (5),
	@frazionabile bit
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/*
NOTE:
- Non diamo la possibilità di modificare le dimensioni di un lotto, in caso di dimensioni errate la rettifica consuma
il lotto e ne versa un'altro con le dimensioni corrette.
- Se la rettifica serve per un lotto che non è in stock(sul sistema) si genera un nuovo lotto dando la possibilità all'utente 
di selezionare un lotto padra (facoltativo)
- Tutto lo storico delle rettifiche lo scriviamo nella tabella [dbo].[adjustments_history] oltre che essere scritto nelle 
transazioni
- In queste funzioni non consideriamo la gestione dello step roll ! (per il momento)
FLUSSO:
1) Si consuma il lotto errato, si include anche magazzino e ubicazione in quanto potrebbero esserci dei frazionabili
2) Si crea un nuovo lotto con le dimensioni corrette 
-2018 12 18: gli articoli frazionabili vengono corretti solo nello stock, 
quindi consumo tutto comunque, ma poi ricarico lo stesso lotto
*/
/* CONSUMO DEL LOTTO ERRATO (usiamo la stessa sp per l'eliminazione) */
exec [dbo].[sp_adjustments_erase_lots] @IDcompany, @IDlot, @mag, @loc, @username, @IDadjtype
declare @NuovoLotto [nvarchar] (20)
declare @getdate DATETIME = getutcdate()
declare @qty float = 0
if (@frazionabile = 0) /* Se non è fraz. creaiamo il nuovo lotto */
begin
	declare @NEW_lotCode nvarchar(20)
	exec sp_generateNewLotCode @IDcompany,@mag,'A', @NEW_lotCode OUTPUT
	select @NuovoLotto = @NEW_lotCode 
	/* Lettura di alcune info dal lotto eliminato dalla sp di eliminazione */
	declare @dad_orig nvarchar (20) = ''
	declare @dad_date datetime
	declare @dad_item nvarchar(max)
	declare @str int
	declare @str_order int
	declare @dad_checked_value bit 
	declare @dad_devaluation int
	declare @dad_value float
	declare @dad_ord_rif nvarchar(100) = ''
	declare @dad_checked_value_date DATETIME
	declare @dad_eur1 bit
	declare @dad_conf_item bit /* 2023-01-02 */
	declare @dad_merged_lot bit /* 2023-01-02 */
	select @dad_date = ld.date_lot, @dad_orig = ld.IDlot_origine, @dad_item = ld.IDitem,  @str_order = ld.step_roll_order, @str = ld.stepRoll,
	       @dad_checked_value = ld.checked_value, @dad_devaluation = ld.devaluation, @dad_ord_rif = ord_rif, @dad_checked_value_date = checked_value_date, 
	       @dad_eur1 = eur1, @dad_conf_item = conf_item, @dad_merged_lot = merged_lot
	from lot ld
	where ld.IDcompany = IDcompany and ld.IDlot = @IDlot
	/* Inserimento lotto in anagrafica lotti */
	exec dbo.sp_lotInserimento @IDcompany, @NuovoLotto, @dad_item, @getdate, @dad_date, @IDlot, @dad_orig, '', NULL, '',@str,@str_order, @DE,@DI,@LA,@LU,@PZ, 
	@dad_checked_value, @dad_devaluation, @dad_ord_rif, @dad_checked_value_date, @dad_eur1, @dad_conf_item, @dad_merged_lot, 4, 0
	/* Calcolo delle qty in base all'um di gestione magazzino */
	set @qty = dbo.calcQtyFromDimensionByUM(@um, @LA,@LU,@PZ,@DI,@DE)
	/* Inserimento valore lotto, il valore all'unità la copiamo da lotto "padre" (il checked è gestito alla creazione del lotto) */
	select @dad_value = lv.UnitValue
	from vw_lot_last_value lv where lv.IDcompany = IDcompany and lv.IDlot = @IDlot
	exec dbo.sp_lot_value_add @IDcompany, @NuovoLotto, @dad_value, @username, 0, ''
end
else
begin  /*Nel caso in cui l'articolo sia frazionabile ... carichiamo lo stesso lotto a magazzino con la qty richiesta */
	set  @qty = @QTY_requested
	set  @NuovoLotto = @IDlot
end
-- Inserimento lotto in stock e nelle transazioni 
exec dbo.sp_main_stock_transaction @IDcompany, @NuovoLotto, @mag, @loc, @um,'+', @qty, 4, @username, '', NULL,null
/* Ne caso in cui la rettifica è con causale "inventario" riportiamo anche l'id dell'inventario attivo 
(è possibile avere un solo inventario attivo per company) */
declare @IDinventory nvarchar(max) = dbo.getActiveInventoryId(@IDcompany, @IDadjtype)
-- Scrittura log nello storico delle rettifiche
insert into dbo.adjustments_history([IDcompany], [date_adj],[IDlot],[IDwarehouse],[IDlocation],[segno],[qty],[IDadjtype],IDinventory, [username])
select @IDcompany,@getdate,@NuovoLotto,@mag,@loc,'+',@qty,@IDadjtype,@IDinventory, @username
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_adjustments_erase_lots]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_adjustments_erase_lots]
	@IDcompany [int],
	@IDlot nvarchar (20),
	@mag nvarchar (max),
	@loc nvarchar (max),
	@username [nvarchar] (35),
	@IDadjtype int
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/* CONSUMO DEL LOTTO ERRATO */
--1) Recupero informazioni per consumare lotto padre
declare @dad_mag nvarchar (max) = null
declare @dad_loc nvarchar (max) = null
declare @dad_qty float = 0
declare @dad_StepRoll bit
declare @dad_StepRollDad nvarchar (20) = ''
declare @dad_StepRollNumber int = 0
declare @dad_StepRollLot nvarchar (20) = ''
declare @dad_StepRollLotQty float = 0
declare @dad_StepRollLotMag int = 0
declare @dad_StepRollLotLoc int = 0
declare @getdate DATETIME = getutcdate()
select @dad_mag = s.IDwarehouse, @dad_loc = s.IDlocation, @dad_qty = s.qty_stock,  @dad_StepRoll = l.stepRoll, /* In caso di step roll consumo tutti i lotti legati */
@dad_StepRollDad = l.IDlot_padre
from dbo.stock s
inner join dbo.lot l on l.IDcompany = s.IDcompany and l.IDlot = s.IDlot
where s.IDcompany = @IDcompany and s.IDlot = @IDlot and s.IDwarehouse = @mag and s.IDlocation = @loc
--2) Eliminazione dallo stock 
exec dbo.sp_main_stock_transaction @IDcompany, @IDlot, @dad_mag, @dad_loc, 'm2','-', @dad_qty, 4, @username, '',NULL,null
/* Nel caso in cui la rettifica è con causale "inventario" riportiamo anche l'id dell'inventario attivo 
(è possibile avere un solo inventario attivo per company) */
declare @IDinventory nvarchar(max) = dbo.getActiveInventoryId(@IDcompany, @IDadjtype)
--3) Scrittura log nello storico delle rettifiche
insert into dbo.adjustments_history([IDcompany], [date_adj],[IDlot],[IDwarehouse],[IDlocation],[segno],[qty],[IDadjtype], [IDinventory], [username])
select @IDcompany,@getdate,@IDlot,@mag,@loc,'-',@dad_qty,@IDadjtype,@IDinventory, @username
end;
GO
/****** Object:  StoredProcedure [dbo].[sp_alterdiagram]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_alterdiagram]
	(
		@diagramname 	sysname,
		@owner_id	int	= null,
		@version 	int,
		@definition 	varbinary(max)
	)
	WITH EXECUTE AS 'dbo'
	AS
	BEGIN
		set nocount on
		declare @theId 			int
		declare @retval 		int
		declare @IsDbo 			int
		declare @UIDFound 		int
		declare @DiagId			int
		declare @ShouldChangeUID	int
		if(@diagramname is null)
		begin
			RAISERROR ('Invalid ARG', 16, 1)
			return -1
		end
	
		execute as caller;
		select @theId = DATABASE_PRINCIPAL_ID();	 
		select @IsDbo = IS_MEMBER(N'db_owner'); 
		if(@owner_id is null)
			select @owner_id = @theId;
		revert;
	
		select @ShouldChangeUID = 0
		select @DiagId = diagram_id, @UIDFound = principal_id from dbo.sysdiagrams where principal_id = @owner_id and name = @diagramname 
		
		if(@DiagId IS NULL or (@IsDbo = 0 and @theId <> @UIDFound))
		begin
			RAISERROR ('Diagram does not exist or you do not have permission.', 16, 1);
			return -3
		end
	
		if(@IsDbo <> 0)
		begin
			if(@UIDFound is null or USER_NAME(@UIDFound) is null) -- invalid principal_id
			begin
				select @ShouldChangeUID = 1 ;
			end
		end
		-- update dds data			
		update dbo.sysdiagrams set definition = @definition where diagram_id = @DiagId ;
		-- change owner
		if(@ShouldChangeUID = 1)
			update dbo.sysdiagrams set principal_id = @theId where diagram_id = @DiagId ;
		-- update dds version
		if(@version is not null)
			update dbo.sysdiagrams set version = @version where diagram_id = @DiagId ;
		return 0
	END;
GO
/****** Object:  StoredProcedure [dbo].[sp_business_partner_dest_add]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_business_partner_dest_add] (
@IDcompany int ,
@IDbp nvarchar (max),
@NewDestDesc nvarchar(200)
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
	insert into dbo.bp_destinations (IDcompany, IDbp, [desc]) 
	select @IDcompany, @IDbp, @NewDestDesc
end;
GO
/****** Object:  StoredProcedure [dbo].[sp_creatediagram]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_creatediagram]
	(
		@diagramname 	sysname,
		@owner_id		int	= null, 	
		@version 		int,
		@definition 	varbinary(max)
	)
	WITH EXECUTE AS 'dbo'
	AS
	BEGIN
		set nocount on
	
		declare @theId int
		declare @retval int
		declare @IsDbo	int
		declare @userName sysname
		if(@version is null or @diagramname is null)
		begin
			RAISERROR (N'E_INVALIDARG', 16, 1);
			return -1
		end
		execute as caller;
		select @theId = DATABASE_PRINCIPAL_ID(); 
		select @IsDbo = IS_MEMBER(N'db_owner');
		revert; 
		if @owner_id is null
		begin
			select @owner_id = @theId;
		end
		else
		begin
			if @theId <> @owner_id
			begin
				if @IsDbo = 0
				begin
					RAISERROR (N'E_INVALIDARG', 16, 1);
					return -1
				end
				select @theId = @owner_id
			end
		end
		-- next 2 line only for test, will be removed after define name unique
		if EXISTS(select diagram_id from dbo.sysdiagrams where principal_id = @theId and name = @diagramname)
		begin
			RAISERROR ('The name is already used.', 16, 1);
			return -2
		end	
		insert into dbo.sysdiagrams(name, principal_id , version, definition)
				VALUES(@diagramname, @theId, @version, @definition) ;		
		select @retval = @@IDENTITY 
		return @retval
	END;
GO
/****** Object:  StoredProcedure [dbo].[sp_cutting_order_confirm]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_cutting_order_confirm]
	@IDcompany [int],
	@IDlot [nvarchar](20),
	@item nvarchar (max),
	@mag nvarchar (max),	
	@username nvarchar (35)
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/* 2020-04-08 Il testo lotto del padre viene riportato nel figlio */
declare @NuovoLotto [nvarchar] (20)
declare @getdate DATETIME = getutcdate()
declare @qty float = 0
declare @numer_of_cuts int = (select COUNT(*) from dbo.cutting_order_row where IDcompany = @IDcompany and IDlot = @IDlot) -- leggo il numero di tagli inseriti
declare @current_cut nvarchar(max) = ''
declare @LA [float] = 0
declare @LU [float] = 0
declare @PZ [float]	= 0
declare @lot_origine [nvarchar] (20) = ''
declare @loc nvarchar(max) = ''
declare @StepRoll as bit
declare @step_roll_order int
declare @ord_rif nvarchar(100) = ''
/* INIZIO CONSUMO LOTTO DA TAGLIARE (o lotti in caso di step roll) */
--1) Recupero informazioni per consumare lotto padre
declare @dad_mag nvarchar (max) = ''
declare @dad_loc nvarchar (max) = ''
declare @dad_qty float = 0
declare @dad_StepRoll bit
declare @dad_StepRollDad nvarchar (20) = ''
declare @dad_StepRollNumber int = 0
declare @dad_StepRollLot nvarchar (20) = ''
declare @dad_StepRollLotQty float = 0
declare @dad_StepRollLotMag nvarchar (max) = ''
declare @dad_StepRollLotLoc nvarchar (max) = ''
declare @dad_value float = 0
declare @dad_checked_value bit 
declare @dad_checked_value_date DATETIME
declare @dad_devaluation int
declare @dad_eur1 bit
declare @dad_conf_item bit  /*2023-01-02 AB*/
declare @dad_merged_lot bit  /*2023-02-28 AB*/
declare @dad_note nvarchar(200) = ''
select @dad_mag = s.IDwarehouse, @dad_loc = s.IDlocation, @dad_qty = s.qty_stock,  @dad_StepRoll = l.stepRoll, /* In caso di step roll consumo tutti i lotti legati */
@dad_StepRollDad = l.IDlot_padre, @dad_checked_value = l.checked_value, @dad_devaluation = l.devaluation, 
@dad_checked_value_date = checked_value_date, @dad_eur1 = eur1, @dad_conf_item = conf_item, @dad_merged_lot = l.merged_lot, @dad_note = l.note
from dbo.stock s
inner join dbo.lot l on l.IDcompany = s.IDcompany and l.IDlot = s.IDlot
where s.IDcompany = @IDcompany and s.IDlot = @IDlot
--2) Eliminazione dallo stock (commessa di taglio, quindi elimineremo sempre l'intera riga dello stock), Scrittura del log nelle transazioni
exec dbo.sp_main_stock_transaction @IDcompany, @IDlot, @dad_mag, @dad_loc, 'm2','-', @dad_qty, 2, @username, '',null,null
if @dad_StepRoll = 1
begin /* E' uno step roll, consumiamo anche tutti i fratelli */
	set @dad_StepRollNumber = (select COUNT(*) from dbo.lot l inner join dbo.stock s on l.IDcompany = s.IDcompany and l.IDlot = s.IDlot
	where l.IDcompany = @IDcompany and l.IDlot_padre = @dad_StepRollDad and l.stepRoll = 1) /* Numero di fratelli step roll da consumare, verifichiamo anche sullo  stock */
	while @dad_StepRollNumber <>  0
	Begin
		/* Selezioniamo man mano tutti i fratelli per andare a consumarli, consumandoli li elimino dallo stock cosi il giro successivo procedo con il prossimo.
		Gli step roll essendo legati saranno sempre ubicati assieme ai fratelli, ma per sicurezza leggiamo idMag idLoc */
		select @dad_StepRollLot = l.IDlot, @dad_StepRollLotQty = s.qty_stock, @dad_StepRollLotMag = s.IDwarehouse,  @dad_StepRollLotLoc = IDlocation
		from dbo.lot l inner join dbo.stock s on l.IDcompany = s.IDcompany and l.IDlot = s.IDlot
		where l.IDcompany = @IDcompany and l.IDlot_padre = @dad_StepRollDad and l.stepRoll = 1
		exec dbo.sp_main_stock_transaction @IDcompany, @dad_StepRollLot, @dad_StepRollLotMag, @dad_StepRollLotLoc, 'm2','-', @dad_StepRollLotQty, 2, @username, '',null,null
		set @dad_StepRollNumber = @dad_StepRollNumber - 1
	end
end
/* INIZIO INSERIMENTO TAGLI DICHIARATI: cicli per ogni taglio inserito */
while @numer_of_cuts <>  0
Begin
	 set @StepRoll = 0
	--seleziono il taglio da gestire, per identificare quelli fatti selezioni quelli con il campo IDlot_new vuoto
	 select top 1 @current_cut = IDcut , @StepRoll = step_roll, @step_roll_order = step_roll_order
	 from dbo.cutting_order_row c where c.IDcompany = @IDcompany and c.IDlot = @IDlot and isnull(IDlot_new,'') = ''
	--inserimento del lotto in anagrafica lotti
	/*
	set @NuovoLotto = (select gen_cod_lot.lot_code + gen_cod_lot.IDcountry + gen_cod_lot.IDlotType + gen_cod_lot.year_number + gen_cod_lot.seriale
					   from dbo.vw_GeneraCodiciLottoPerCompany gen_cod_lot
					   inner join dbo.warehouse wh on wh.IDcompany = gen_cod_lot.IDcompany and wh.IDcountry = gen_cod_lot.IDcountry
					   where gen_cod_lot.IDcompany = @IDcompany 
					   and   IDlotType = 'V' 
					   and   wh.IDwarehouse = @mag) */
	DECLARE @NEW_lotCode nvarchar(20)
	EXEC sp_generateNewLotCode @IDcompany,@mag,'F', @NEW_lotCode OUTPUT
	SELECT @NuovoLotto = @NEW_lotCode 
	--Inserisco il nuovo lotto generato nella tabella dei tagli (in modo da non selezionarlo al prossimo ciclo)
	update dbo.cutting_order_row set IDlot_new = @NuovoLotto where IDcompany = @IDcompany and IDcut = @current_cut
	-- Leggo le dimensioni del taglio e le salvo (le uso 2 volte, mi conviene salvarle) + l'ubicazione di versamento (il mag viene passato ed è quello di prelievo del padre)
	select @LA = LA, @LU = LU, @PZ = PZ, @loc = IDlocation, @ord_rif = ord_rif
	from dbo.cutting_order_row c where c.IDcompany = @IDcompany and c.IDcut =  @current_cut
	--Inserimento lotto in anagafica lotti /* verificare lotto padre ecc  ------------------------------------------*/	
	set @lot_origine = (select IDlot_origine from lot where IDcompany = @IDcompany and IDlot = @IDlot)					
	exec dbo.sp_lotInserimento @IDcompany, @NuovoLotto, @item, @getdate, @getdate, @IDlot, @lot_origine,'', null, @dad_note,@StepRoll, @step_roll_order,  0,0,@LA,@LU,@PZ, 
		 @dad_checked_value, @dad_devaluation, @ord_rif, @dad_checked_value_date, @dad_eur1, @dad_conf_item, @dad_merged_lot, 2, 0
	-- Calcolo qty in m2 (questa è una commessa di taglio e accetta solo materiali in m2 !!!)		
	set @qty = dbo.calcQtyFromDimensionByUM('m2', @LA,@LU,@PZ,0,0)
	/* Inserimento valore lotto, il valore all'unità la copiamo da lotto "padre" */	
	select @dad_value = lv.UnitValue
	from vw_lot_last_value lv where lv.IDcompany = @IDcompany and lv.IDlot = @IDlot
	exec dbo.sp_lot_value_add @IDcompany, @NuovoLotto, @dad_value, @username, 0, ''
	-- Inserimento lotto in stock e nelle transazioni (il checked è preso dal padre, e viene gestito quando viene creato il lotto)
	exec dbo.sp_main_stock_transaction @IDcompany, @NuovoLotto, @mag, @loc, 'm2','+', @qty, 2, @username, @ord_rif, null,null
	set @numer_of_cuts = @numer_of_cuts - 1
end
-- Segno la commessa di taglio come eseguita
update dbo.cutting_order set executed = 1, date_executed = @getdate where IDcompany = @IDcompany and IDlot = @IDlot
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_cutting_order_insert_row]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_cutting_order_insert_row]
	@IDcompany [int],
	@IDlot [nvarchar](20),
	@la [float],
	@lu [float],
	@pz [int],
	@ord_rif nvarchar (100) ,
	@step_roll bit,
	@step_roll_order int,
	@username nvarchar (35),
	@location nvarchar (max)
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
declare @getdate DATETIME = getutcdate()
-- controllo se c'è già una testata per questa commessa di taglio, se non c'è la creo
declare @checkHeader int = (select COUNT(*) from dbo.cutting_order where IDcompany = @IDcompany and IDlot = @IDlot)
if (@checkHeader = 0)
begin
	insert into dbo.cutting_order (IDcompany,IDlot, username, date_creation) values (@IDcompany,@IDlot,@username,@getdate)
end
if (@step_roll = 1)  /* Se è uno step roll controllo che non ci sia già un taglio settato come step roll, in tal caso forzo l'ubicazione di destinazione */
begin
	declare @checkLocStepRoll nvarchar(max) = (select top 1 IDlocation from dbo.cutting_order_row where IDcompany = @IDcompany and IDlot = @IDlot and step_roll = 1)
	if (@checkLocStepRoll is not null)
	begin
		set @location = @checkLocStepRoll
	end
end
else begin set @step_roll_order = 0 end /* Se non è uno step roll non ha senso avere l'ordine anche se lo hanno inserito */
--inserimento del taglio
insert into dbo.cutting_order_row (IDcompany,IDlot,PZ,LA,LU,ord_rif,step_roll,step_roll_order,IDlocation) values 
(@IDcompany,@IDlot,@pz,@la,@lu,@ord_rif,@step_roll,@step_roll_order,@location)
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_dropdiagram]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_dropdiagram]
	(
		@diagramname 	sysname,
		@owner_id	int	= null
	)
	WITH EXECUTE AS 'dbo'
	AS
	BEGIN
		set nocount on
		declare @theId 			int
		declare @IsDbo 			int
		
		declare @UIDFound 		int
		declare @DiagId			int
	
		if(@diagramname is null)
		begin
			RAISERROR ('Invalid value', 16, 1);
			return -1
		end
	
		EXECUTE AS CALLER;
		select @theId = DATABASE_PRINCIPAL_ID();
		select @IsDbo = IS_MEMBER(N'db_owner'); 
		if(@owner_id is null)
			select @owner_id = @theId;
		REVERT; 
		
		select @DiagId = diagram_id, @UIDFound = principal_id from dbo.sysdiagrams where principal_id = @owner_id and name = @diagramname 
		if(@DiagId IS NULL or (@IsDbo = 0 and @UIDFound <> @theId))
		begin
			RAISERROR ('Diagram does not exist or you do not have permission.', 16, 1)
			return -3
		end
	
		delete from dbo.sysdiagrams where diagram_id = @DiagId;
	
		return 0;
	END;
GO
/****** Object:  StoredProcedure [dbo].[sp_generateNewLotCode]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_generateNewLotCode] (@IDcomp int, @IDwarehouse nvarchar(max), @type nvarchar(2), @NEW_lotCode nvarchar(20) out)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
	
	/* -- I primi 2 caratteri arrivano dalla tabella delle company "lot_code" 
	   -- 2 secondi 2 caratteri "country" sono legati al magazzino, in base a dove viene versato
	   -- il 5 carattere è il tipo di lotto, A = acquistato, F = finito\tagliato (parametro richiesto in input)
	   -- il 6 e 7 rappresentano l'anno di creazione del lotto
	   -- l'ultimo è un numero incrementale di 6 cifre
	   *Logica
	   1) Leggo dalla tabella dei "numeri primi" il record che corrisponde ai parametri passati + la data
	   2) Se non c'è lo creo con numerazione 000001
	   3) Se c'è incremento di uno, salvo, e restituisco
    */ 
	BEGIN TRANSACTION [LotCode]   /* Attivazione della transazione */
	DECLARE @last_incr int = 0
	DECLARE @new_incr nvarchar(6) = ''
	set @NEW_lotCode = ''	
	DECLARE @curr_year int = substring(cast(year(getutcdate()) as char),3,2)
	DECLARE @lot_code [nvarchar](2) = (select lot_code from company where IDcompany = @IDcomp)
	DECLARE @country_code [nvarchar](2) = (select IDcountry from warehouse where IDwarehouse = @IDwarehouse)
	set @last_incr = (select isnull(max(incrementale), 0)
					  from dbo.lot_numeri_primi with (tablock, holdlock)   /* LOCK della tabella, per impedire accessi multipli */
					  where IDcompany = @IDcomp
					  and comp_code = @lot_code
					  and country_code = @country_code
					  and [type] = @type
					  and year_n = @curr_year
					  ) 
 if (@last_incr = 0)
	 begin --inserimento del primo numero 
		set @NEW_lotCode = @lot_code + @country_code + @type + substring(cast(year(getutcdate()) as char),3,2) + '000001'
		insert into [dbo].[lot_numeri_primi] (IDcompany,comp_code,country_code,[type],year_n,incrementale) VALUES (@IDcomp,@lot_code,@country_code, @type, @curr_year,1)
	 end
	 else
	 begin -- incremeto del numero 
		set @new_incr = format (@last_incr + 1, '000000') 
		set @NEW_lotCode = @lot_code + @country_code + @type + substring(cast(year(getutcdate()) as char),3,2) + @new_incr
		
		update [dbo].[lot_numeri_primi] 
		set incrementale = @new_incr
		where IDcompany = @IDcomp
		and [comp_code] =  @lot_code
		and [country_code] = @country_code
		and [type] = @type
		and year_n = @curr_year
	 end
	COMMIT TRANSACTION [LotCode]
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_helpdiagramdefinition]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_helpdiagramdefinition]
	(
		@diagramname 	sysname,
		@owner_id	int	= null 		
	)
	WITH EXECUTE AS N'dbo'
	AS
	BEGIN
		set nocount on
		declare @theId 		int
		declare @IsDbo 		int
		declare @DiagId		int
		declare @UIDFound	int
	
		if(@diagramname is null)
		begin
			RAISERROR (N'E_INVALIDARG', 16, 1);
			return -1
		end
	
		execute as caller;
		select @theId = DATABASE_PRINCIPAL_ID();
		select @IsDbo = IS_MEMBER(N'db_owner');
		if(@owner_id is null)
			select @owner_id = @theId;
		revert; 
	
		select @DiagId = diagram_id, @UIDFound = principal_id from dbo.sysdiagrams where principal_id = @owner_id and name = @diagramname;
		if(@DiagId IS NULL or (@IsDbo = 0 and @UIDFound <> @theId ))
		begin
			RAISERROR ('Diagram does not exist or you do not have permission.', 16, 1);
			return -3
		end
		select version, definition FROM dbo.sysdiagrams where diagram_id = @DiagId ; 
		return 0
	END;
GO
/****** Object:  StoredProcedure [dbo].[sp_helpdiagrams]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_helpdiagrams]
	(
		@diagramname sysname = NULL,
		@owner_id int = NULL
	)
	WITH EXECUTE AS N'dbo'
	AS
	BEGIN
		DECLARE @user sysname
		DECLARE @dboLogin bit
		EXECUTE AS CALLER;
			SET @user = USER_NAME();
			SET @dboLogin = CONVERT(bit,IS_MEMBER('db_owner'));
		REVERT;
		SELECT
			[Database] = DB_NAME(),
			[Name] = name,
			[ID] = diagram_id,
			[Owner] = USER_NAME(principal_id),
			[OwnerID] = principal_id
		FROM
			sysdiagrams
		WHERE
			(@dboLogin = 1 OR USER_NAME(principal_id) = @user) AND
			(@diagramname IS NULL OR name = @diagramname) AND
			(@owner_id IS NULL OR principal_id = @owner_id)
		ORDER BY
			4, 5, 1
	END;
GO
/****** Object:  StoredProcedure [dbo].[sp_lot_value_add]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_lot_value_add] (
@IDcompany int ,
@IDlot nvarchar(20),
@UnitValue float,
@username nvarchar(35),
@checked bit,           /* Se è l'utente che controlla è a 1 */
@note nvarchar(150)
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/* 20200218 arrotondo a 4 cifre il valore */
set @UnitValue = round(@UnitValue,4)
/* Inserisco il valore (in questa tabella ci posso essere più valori per singolo lotto, l'ultimo è quello effettivo) */
insert into dbo.lot_value (IDcompany,IDlot,date_ins,UnitValue,username,IDdevaluation,note)
select @IDcompany, @IDlot, getutcdate(), @UnitValue, @username, NULL, @note
/* check che l'utente ha verificato */
if (@checked = 1)
begin
	update dbo.lot
	set checked_value = 1, checked_value_date = getutcdate()
	where IDcompany = @IDcompany and IDlot = @IDlot
end
end;
GO
/****** Object:  StoredProcedure [dbo].[sp_lot_value_devaluation]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_lot_value_devaluation]
    @IDcompany [int],
	@username nvarchar (35)
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
declare @dev_id int = 0
declare @countDev int = (select isnull(COUNT(IDlot),0) from dbo.vw_lots_devaluation c where c.IDcompany = @IDcompany and CurrentUnitValue <> UnitValueDevalueted)
/*
 1) Creazione storico devalutazioni
 2) Inserimento dei prezzi devalutati 
 3) Aggiornamento dell'anagrafica lotti del campo devaluation
*/
if (@countDev <> 0)
begin 
	--1)
	insert into dbo.devaluation_history (IDcompany, date_dev, username)
	select @IDcompany, getutcdate(), @username
	
	select @dev_id = max(dh.IDdevaluation)
	from  dbo.devaluation_history dh
	where dh.IDcompany = @IDcompany and dh.username = @username
	
	--2)
	/*select uguale a quella presente nella pagina lot_devaluation_forecast,
	prendo tutti i record con valore corrente diverso dal valore devalutato, gli altri 
	chiaramente non verranno devalutati in quanto non hanno le caratteristiche per essere inclusi 
	(dbo.sp_lot_value_add: nel sistema viene utilizzata questa sp per effttuare aggiornamenti ai valori) */
	insert into dbo.lot_value
	select dv.IDcompany, dv.IDlot, getutcdate(), dv.UnitValueDevalueted, @username, @dev_id, ''
	from dbo.vw_lots_devaluation dv
	where  dv.IDcompany = @IDcompany 
	and CurrentUnitValue <> UnitValueDevalueted
	
	--3)
	update Lot  
	set Lot.devaluation = Deval.devaluation_type 
	from dbo.lot as Lot
	inner join dbo.vw_lots_devaluation as Deval ON Lot.IDcompany = Deval.IDcompany and Lot.IDlot = Deval.IDlot
	where Lot.IDcompany = @IDcompany
	and CurrentUnitValue <> UnitValueDevalueted
end
	
end;
GO
/****** Object:  StoredProcedure [dbo].[sp_lot_value_devaluation_exclude_lot]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_lot_value_devaluation_exclude_lot]
    @IDcompany [int],
	@username nvarchar (35),
	@IDlot nvarchar(20),
	@note nvarchar(150)
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/*
Questa funzione viene usata per escludere un lotto previsto per la devalutazione:
1) Inseriremo nel valore del lotto un record aggiuntivo uguale al precedente con il commento 
per la non avvenuta devalutazione.
2) Aggiornaimo il campo "devaluation" in anagrafica lotti 0,2,4 - 99 in modo che il lotto non
venga più "visto" dalla devalutazione che sta avvenendo, il numero 99 in anagrafica significa che 
il lotto è stato escluso dalla devalutazione.
Note:
- il campo data di riferimento è quella del lotto origine.
- il campo "devaluation" di riferimento è quella del lotto corrente in quando viene
ereditata dai lotti precedenti.
- se volessimo estrarre quali lotti sono stati skippati basta prendere quelli con 
*/
declare @CurrentUnitValue float 
declare @devaluation_type int 
/* Recupero le info dalla vista delle devalutazione */
select @CurrentUnitValue = UnitValue
from dbo.vw_lot_last_value where IDcompany = @IDcompany and IDlot = @IDlot

/* Inserisco il valore, che è uguale al precedente, ma ha il commento esplicativo */
insert into dbo.lot_value 
select @IDcompany, @IDlot, getutcdate(), @CurrentUnitValue, @username, 0, 'Excluded devaluation: ' + @note

update dbo.lot set devaluation = 99 where IDcompany = @IDcompany and IDlot = @IDlot
end;
GO
/****** Object:  StoredProcedure [dbo].[sp_lotInserimento]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_lotInserimento]
	@IDcompany [int],
	@IDlot [nvarchar](20),
	@IDitem [nvarchar](max),
	@date_ins [datetime],
	@date_lot [datetime],
	@IDlot_padre [nvarchar](20),
	@IDlot_origine [nvarchar](20),
	@IDlot_fornitore [nvarchar](20),
	@IDsupplier [nvarchar] (100) = null,
	@note [nvarchar](200),
	@StepRoll bit,
	@step_roll_order int,
	@DE [float],
	@DI [float],
	@LA [float], 
	@LU [float],
	@PZ [float],
	@checked_val bit,
	@devaluation int,
	@ordine_rif [nvarchar](100),
	@checked_val_date datetime,
	@eur1 bit, /* 2020 04 02 */
	@conf_item bit, /* 2023 01 02 */
	@merged_lot bit, /* 2023 02 28 */
	@IDcausaleMovimentazione int, /* 2023 03 13 */
	@IDorder nvarchar /* 2023 03 13 */
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/*	Used on (at 2023-03-13)
	- dbo.sp_lotInserimento         						 
	- dbo.sp_ricevimento_acquisto
	- sp_cutting_order_confirm							    
	- sp_adjustments_erase_add_lots						 
	- sp_adjustments_add_new_lots							 
	- sp_order_split_confirm			
	- sp_order_merge_confirm
*/

INSERT INTO [dbo].[lot] (IDcompany,IDlot,IDitem,date_ins,date_lot,IDlot_padre,IDlot_origine, 
						IDbp, note, IDlot_fornitore, stepRoll, step_roll_order, checked_value, devaluation, ord_rif, checked_value_date, eur1, conf_item, merged_lot
						) 
VALUES (@IDcompany, @IDlot, @IDitem, @date_ins, @date_lot, @IDlot_padre, @IDlot_origine, 
		@IDsupplier, @note, @IDlot_fornitore, @StepRoll, @step_roll_order, @checked_val, @devaluation, @ordine_rif, @checked_val_date, @eur1, @conf_item, @merged_lot  
		)

/* 2023-03-13
   Popolozione della tabella [dbo].[lot_tracking_origin] per la tracciabilità "molti-molti" dovuta
   all'aggiunta degli order merge.
   - Nel caso di ordini che non sono "merge" dobbiamo comunque "cercare" le origine partendo dal lotto padre,
	 perchè potrebbe essere un lotto "merged" che viene tagliato e quindi trovarci più origini.
if (@IDcausaleMovimentazione <> 6)
begin 
	---- NO ! RICERCA SU ORIGINI (NEL CASO IN CUI NON SIA IL PIRMO LOTTO ..... AD ESEMPIO NEL CASO DELLE ADJUSTMENT)
	insert into [dbo].[lot_tracking_origin] ([IDcompany], [IDlot], [IDlot_origin], [date_track])
	select @IDcompany, @IDlot, @IDlot_origine, GETUTCDATE()
end else begin
	insert into [dbo].[lot_tracking_origin] ([IDcompany], [IDlot], [IDlot_origin], [date_track])
	select  
	from [dbo].[order_merge_rows_picking] o
	inner join dbo.lot l on l.IDcompany = o.IDcompany and o.IDlot = l.IDlot
end
*/

/* Inserimento delle dimensioni lotto in base a quelle definite per l'um dell'articolo */
insert into dbo.lot_dimension (IDcompany,IDlot,IDcar,val)
select @IDcompany,@IDlot, IDcar, 
(select case 
when IDcar = 'DE' then @DE
when IDcar = 'DI' then @DI
when IDcar = 'LA' then @LA
when IDcar = 'LU' then @LU
when IDcar = 'PZ' then @PZ
end
)
from dbo.item item inner join dbo.um_dimension um on  um.IDdim = item.um 
where IDitem = @IDitem 
/* La tabella degli articoli è condivisa */
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_main_stock_transaction]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_main_stock_transaction]
	@IDcompany [int],
	@IDlot [nvarchar](20),	
	@mag nvarchar (max),
	@loc nvarchar (max),	
	@um [nvarchar] (5),
	@segno [nvarchar] (1),
	@qty [float],
	@IDcausaleMovimentazione [int],
	@username nvarchar (35),
	@ord_riferimento nvarchar (100),
	@IDbp nvarchar(max) = null,
	@IDprodOrd nvarchar(max) = null
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/*
- Questa funzione DEVE ESSERE USATA PER QUALSIASI MOVIMENTAZIONE DI MAGAZZINO 
  si occupa principalmente di aggiornare la tabella stock e le transazioni
- I materiali in m2 vengono movimentati interamente, quelli a numero invece sono divisibili e possono essere consumati frazionati
- 2018 12 15: La funzione è stata semplificata per gestire indistintamente articoli frazionabili e non.
- 2020 04 08: Valutazione se aggiungere ulteriori controlli per prevenire giacenze negativa, ma dopo analisi
			  si è preferito mantenere l'attuale flusso in modo che in caso di errori\bug a livello di pagina
			  web sia "facile" capire cosa sia successo tramite le transactions e correggere eventuali errori sulle pagine
*/
declare @getdate DATETIME = getutcdate()
declare @CurrentQty float = 0
declare @CheckQtyOnStock float = 0 
if (@qty <> 0) /* Controllo aggiuntivo*/
begin
	if (@segno = '-')   /* SCARICO DI MAGAZZINO */
	begin
		set @CurrentQty = (select sum(qty_stock) from dbo.stock where IDcompany = @IDcompany and IDlot = @IDlot and IDwarehouse = @mag and IDlocation = @loc)
		if ((@CurrentQty - @qty) = 0) begin
			--Eliminazione dalla tabella dello stock
			delete from dbo.stock where IDcompany = @IDcompany and IDlot = @IDlot and IDwarehouse = @mag and IDlocation = @loc
		end else begin
			--Decremento dell'attuale giacenza
			update dbo.stock set qty_stock = qty_stock - @qty where IDcompany = @IDcompany and IDlot = @IDlot and IDwarehouse = @mag and IDlocation = @loc
		end
		--Scrittura del log nelle transazioni
		insert into dbo.transactions (IDcompany, date_tran, IDlot, IDwarehouse, IDlocation, segno, IDtrantype, ord_rif, username,qty,IDbp, IDprodOrd)
		select @IDcompany, @getdate, @IDlot, @mag, @loc, '-', @IDcausaleMovimentazione,@ord_riferimento,@username, @qty, @IDbp, @IDprodOrd
	end

	if (@segno = '+') /* CARICO DI MAGAZZINO */
	begin
		set @CurrentQty = (select sum(qty_stock) from dbo.stock where IDcompany = @IDcompany and IDlot = @IDlot and IDwarehouse = @mag and IDlocation = @loc)
		if (@CurrentQty <> 0) begin 
			--Materiale già a magazzino, aggiungo la qty 
			update dbo.stock set qty_stock = qty_stock + @qty where IDcompany = @IDcompany and IDlot = @IDlot and IDwarehouse = @mag and IDlocation = @loc	
		end else begin
			--Inserimento nella tabella dello stock
			insert into dbo.stock (IDcompany, IDlot, IDwarehouse, IDlocation, qty_stock)
			select @IDcompany, @IDlot, @mag, @loc, @qty
		end
		--Scrittura del log nelle transazioni
		insert into dbo.transactions (IDcompany, date_tran, IDlot, IDwarehouse, IDlocation, segno, IDtrantype, ord_rif, username,qty,IDbp,IDprodOrd)
		select @IDcompany, @getdate, @IDlot, @mag, @loc, '+', @IDcausaleMovimentazione,@ord_riferimento,@username, @qty,@IDbp,@IDprodOrd 
	end
end
end;
GO
/****** Object:  StoredProcedure [dbo].[sp_order_merge_confirm]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_order_merge_confirm]
	@IDcompany [int],
	@IDmerge bigint,
	@username nvarchar (35)
	
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/* 	2023-02-24
	Note
	- Gli step roll non sono permessi: NO 
	- Il testo lotto aggregherempo ? ... SI
	- Creare ID tipo ordine nuovo  ...... Mantenere produzione ? SI
	- creare tabella per gestire il "molti-molti" nella tracciabilità, con, ordine, lotto ori, lotto dest : SI
	- Creare gli indici nelle 3 tabelle nuove
	- CREARE UN CAMPO AGGIUNTIVO SULL'ANAGRAFICA LOTTI "merged" bit .. yes\no  : FATTO 
	- VALORE = somma del valore dei 2 lotti precedenti ? In ottica dellla modifica set di value con il valore di acquisto ? fare la media ?
	- La stampa PDF come richiesto da Delboca
	- verificare che se taglio un lotto "merged" si porta dietro l'informazione che sia merged
	select * from [dbo].[order_merge]
	select * from [dbo].[order_merge_rows_picking]
	select * from [dbo].[order_merge_rows_return]
	truncate table [dbo].[order_merge]
	truncate table [dbo].[order_merge_rows_picking]
	truncate table [dbo].[order_merge_rows_return]
*/
/*
VERIFICHE FATTIBILITA
- Min 2 lotti
- Che siano sullo stesso mag
- Che l'ID stock sia ancora a magazzino
- la verifica degli step roll è fatto esternamente
-
*/
	declare @getdate DATETIME = getutcdate()
	declare @numer_of_lots int      = (select COUNT(*) from dbo.order_merge_rows_picking where IDcompany = @IDcompany and IDmerge = @IDmerge) -- leggo il numero di lotti da prelevare
	declare @numer_of_lost_lots int = (select COUNT(*) from dbo.order_merge_rows_picking p 
												  left join dbo.stock s on s.IDstock = p.IDStock 
												  where p.IDcompany = @IDcompany and IDmerge = @IDmerge and s.IDlot is null) -- leggo se ci sono lotti che sono poi stati movimentati
	declare @dads_lot [nvarchar] (20)
	declare @dads_itm int
	declare @dads_mag int
	declare @dads_loc int
	declare @dads_qty float
	declare @dads_IDstock bigint
	declare @dads_value_sum float = 0		 	--sommatoria del valore totale (usiamo queste sum per calcolare il valore medio pesato)
	declare @dads_qty_sum float = 0				--sommatoria della quantità (usiamo queste sum per calcolare il valore medio pesato)
	declare @dads_avg_val float = 0
	declare @dads_checked_value bit
	declare @dads_checked_value_date DATETIME
	declare @dads_eur1 bit
	declare @dads_conf_item bit  /*2023-01-02 AB*/
	declare @return_lot [nvarchar] (20)
	declare @return_LA [float] = 0
	declare @return_LU [float] = 0
	declare @return_PZ [float]	= 0
	declare @return_loc int = 0
	declare @return_ord_ref nvarchar(100) = ''
	declare @return_qty float = 0
	if (@numer_of_lost_lots = 0)
	begin
		/* Generiamo subito il codice lotto da versare per poter scrivere nella tracciabilità dentro il while del consumo */
		DECLARE @NEW_lotCode nvarchar(20)
		EXEC sp_generateNewLotCode @IDcompany,@dads_mag,'F', @NEW_lotCode OUTPUT
		SELECT @return_lot = @NEW_lotCode 
		/* Consumo dei lotti */
		while @numer_of_lots <>  0
		Begin
				/* NB, gli step roll vengono gestiti a monte, dobbiamo quindi solo preoccuparci di consumare i lotti che troviamo */
				set @dads_lot = ''
				set @dads_itm = 0
				set @dads_mag = 0
				set @dads_loc = 0
				set @dads_qty = 0
				set @dads_IDstock = 0
			
				select top 1
					   @dads_IDstock = p.IDStock, @dads_lot = p.IDlot, @dads_mag = s.IDwarehouse, @dads_loc = s.IDlocation, @dads_qty = p.qty, @dads_itm = l.IDitem,
					   @dads_value_sum = @dads_value_sum + (lv.UnitValue * p.qty),
					   @dads_qty_sum = @dads_qty_sum + p.qty
				from order_merge_rows_picking p 
				inner join dbo.lot l on l.IDcompany = p.IDcompany and p.IDlot = l.IDlot
				inner join dbo.stock s on s.IDstock = p.IDStock 
				left outer join vw_lot_last_value lv on lv.IDcompany = @IDcompany and lv.IDlot = p.IDlot
				where p.IDcompany = @IDcompany and IDmerge = @IDmerge and p.date_picked is null
				-- Prelievo da magazzino
				exec dbo.sp_main_stock_transaction @IDcompany, @dads_lot, @dads_mag, @dads_loc, 'm2','-', @dads_qty, 2, @username, '',null,null
				-- Scriviamo la data di prelievo
				update order_merge_rows_picking  
				set date_picked = @getdate
				where IDcompany = @IDcompany and IDmerge = @IDmerge and IDStock = @dads_IDstock
				
				
				
				----------------------------------------------------------------------------------- TRACCIABILITà ESTESA PER COMMESSE DI CONSUMO
				-- QUI PER OGNI LOTTO ANDARE A COMPILARE LA TABELLA CON ORIGINE -> DESCITNAZIONE ...   per ogni l
									
	
				set @numer_of_lots = @numer_of_lots - 1
		end

		/* ---- Generazioni delle caratteristiche del lotto merged sulla base di considerazioni dei lotti prelevati */
		if (@dads_value_sum <> 0 and @dads_qty_sum <> 0 )				 -- calcolo del valore medio ("pesato")
			begin set @dads_avg_val = @dads_value_sum / @dads_qty_sum end
		else
			begin set @dads_avg_val = 0 
		end
		declare @dads_checked_value_count int
		declare @dads_eur1_count int
		declare @dads_conf_item_count int
		select @dads_checked_value_count = sum(case when checked_value = 1 then 1 else 0 end),
			   @dads_eur1_count =		   sum(case when conf_item = 1 then 1 else 0 end),
			   @dads_conf_item_count =	   sum(case when eur1 = 1 then 1 else 0 end),
			   @dads_checked_value_date =   min(checked_value_date)
		from order_merge_rows_picking p 
		inner join dbo.lot l on l.IDcompany = p.IDcompany and p.IDlot = l.IDlot
		inner join dbo.stock s on s.IDstock = p.IDStock 			
		where p.IDcompany = @IDcompany and IDmerge = @IDmerge
		group by checked_value, eur1, conf_item, checked_value_date

		if (@numer_of_lots = @dads_checked_value_count)				-- checked value, solo se tutti sono checked mettiamo "checked a si"
			begin set @dads_checked_value = 1 end
		else
			begin set @dads_checked_value = 0 end
		if (@numer_of_lots = @dads_eur1_count)						-- eur1, solo se tutti sono eur1 mettiamo a si
			begin set @dads_eur1 = 1 end
		else
			begin set @dads_eur1 = 0 end
		if (@numer_of_lots = @dads_conf_item_count)					-- conf_itm, solo se tutti sono config. mettiamo a si
			begin set @dads_conf_item = 1 end
		else
			begin set @dads_conf_item = 0 end



		--Inserisco il nuovo lotto generato nella tabella di testata
		update dbo.order_merge set IDlot_destination = @return_lot, date_executed = @getdate where IDcompany = @IDcompany and IDmerge = @IDmerge
		-- Leggo le dimensioni del lotto da versare che sarà sempre e solo 1 
		select @return_LA = LA, @return_LU = LU, @return_PZ = PZ, @return_loc = IDlocation, @return_ord_ref = ord_ref
		from dbo.order_merge_rows_return c where c.IDcompany = @IDcompany and c.IDmerge =  @IDmerge
		--Inserimento lotto in anagafica lotti /* verificare lotto padre ecc  ------------------------------------------*/	
		exec dbo.sp_lotInserimento @IDcompany, @return_lot, @dads_itm, @getdate, @getdate, '', '','', '', '',0, 0,  0,0,
		@return_LA, @return_LU, @return_PZ, @dads_checked_value, 0, @return_ord_ref, @dads_checked_value_date, @dads_eur1, @dads_conf_item, 1, 6
		-- Calcolo qty in m2 (questa è una commessa di taglio e accetta solo materiali in m2 !!!)		
		set @return_qty = dbo.calcQtyFromDimensionByUM('m2', @return_LA, @return_LU, @return_PZ,0,0)
		/* Inserimento valore lotto, il valore all'unità la copiamo da lotto "padre" */	
		exec dbo.sp_lot_value_add @IDcompany, @return_lot, @dads_avg_val, @username, 0, ''
		-- Inserimento lotto in stock e nelle transazioni (il checked è preso dal padre, e viene gestito quando viene creato il lotto)
		exec dbo.sp_main_stock_transaction @IDcompany, @return_lot, @dads_mag, @return_loc, 'm2','+', @return_qty, 2, @username, @return_ord_ref,null,null
	end
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_order_merge_picking_add]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_order_merge_picking_add] (@IDcomp int, @username nvarchar(35), @IDstock bigint, @IDmerge bigint)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
		declare @getdate DATETIME = getutcdate()
		declare @checkIDstock int = isnull((select count(*) from [dbo].[order_merge_rows_picking] where IDcompany = @IDcomp and IDStock = @IDstock),0)
		if(@checkIDstock=0) --controllo che quell'idstock non sia già presente in una altro merge lot
		begin
			if (@IDmerge = 0)  /* Se è il primo lotto deve "creare" anche la testata, quindi, 
			quando gli passiamo zero creiamo un nuovo id e lo valorizziamo, DOBBIAMO necessariamente mandargli un ID di ordine
			dalla pagina per legare i lotti aggiunti, SALVATO ID TRAMITE hidden FIELD */
			begin
				/* Aggiungere un controllo che l'IDstock non sia già presente ???????????????? */
				insert into dbo.order_merge (IDcompany, username, date_creation) 			
				values (@IDcomp,@username,@getdate)
				set @IDmerge = SCOPE_IDENTITY()		
			end
				
			insert into dbo.order_merge_rows_picking (IDcompany, IDmerge, IDStock, IDlot, qty, date_ins, username)
			select IDcompany, @IDmerge, IDstock, IDlot, qty_stock , @getdate, @username
			from stock 
			where IDcompany =  @IDcomp and IDstock = @IDstock
			/* Per evitare che inseriscano più volte lo stesso record (check presente anche sulla query dei lotti da aggiungere) */
			and  IDstock not in (select ct.IDstock from order_merge_rows_picking ct where ct.IDcompany = @IDcomp)
		
			/* Aggiunta automatica di lotti STEP roll legati a lotti inseriti dall'utente */
			insert into dbo.order_merge_rows_picking  (IDcompany, IDmerge, IDStock, IDlot, qty,date_ins, username)
		
			/* STEP ROLL ********************** , (2023-02-04 Logica copiata da cutting order */
			/*2020-06-15 Creata una nuova query per l'estrazione degli step roll, la precedente dava problemi nel caso
			della company USA in qui i lotti importati avevano il lotto padre settato a se stesso, questo tipo di estrazione è 
			presente anche su Cutting.php \ sql per trasferimento\ sql per spedizione(issue) */
			select l.IDcompany, @IDmerge, s.IDstock, s.IDlot, s.qty_stock, @getdate, @username
			from dbo.stock s
			inner join dbo.lot l on s.IDcompany = l.IDcompany and s.IDlot = l.IDlot
			where l.IDlot_padre in
						/*Estraggo tutti i lotti padre dei lotti che sono presenti nel tabella order_merge_row */ 
						(select distinct				
								case when l.stepRoll = 1 then l.IDlot_padre
										  else 'ZZZZZZZZZZZZZ'end /* ID lotto padre fasullo per non estrarre nulla */
								/* 2020 10 22, esclusione dei lotti che vengono inseriti 
								da trasferire e che arrivano da commesse di taglio contenenti degli stepRoll ma che essi non lo sono, es :
								Lot1 StepRoll
								Lot2 StepRoll
								Lot3 Lotto normale, voglio spedire questo, non devo prendere i fratelli che sono step roll
								*/
						from dbo.order_merge_rows_picking t
						inner join dbo.stock s on s.IDcompany = t.IDcompany and t.IDStock = s.IDstock
						inner join dbo.lot l on l.IDcompany = t.IDcompany and s.IDlot = l.IDlot
						where t.IDcompany =  @IDcomp and IDmerge = @IDmerge)
			and s.IDcompany = @IDcomp
			and l.stepRoll = 1 
			-- Per escludere i possibili "fratelli" già inseriti dagli utenti 
			and s.IDstock not in (select tt.IDStock from dbo.order_merge_rows_picking tt where tt.IDcompany = @IDcomp)
		end
end;
GO
/****** Object:  StoredProcedure [dbo].[sp_order_merge_picking_del]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_order_merge_picking_del] (@IDcompany int, @IDmerge bigint, @IDmerge_row_return_id bigint)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
	declare @numer_of_lots int = (select COUNT(*) from dbo.order_merge_rows_picking where IDcompany = @IDcompany and IDmerge = @IDmerge) -- leggo il numero di lotti presenti
	if @numer_of_lots = 1
	begin
		delete from [dbo].[order_merge] where IDcompany = @IDcompany and IDmerge = @IDmerge
		delete from [dbo].[order_merge_rows_picking]  where IDcompany = @IDcompany and IDmerge = @IDmerge
		delete from [dbo].[order_merge_rows_return]  where IDcompany = @IDcompany and IDmerge = @IDmerge
	end
	else
	begin
		delete from [dbo].[order_merge_rows_picking] where  IDcompany = @IDcompany and IDmerge_row_picking_id = @IDmerge_row_return_id		
	end
end;
GO
/****** Object:  StoredProcedure [dbo].[sp_order_merge_return_add]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_order_merge_return_add]
	@IDcompany [int],
	@IDmerge bigint,
	@la [float],
	@lu [float],
	@pz [int],
	@ord_ref nvarchar (100) ,
	@username nvarchar (35),
	@location int
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/*
	2023-02-24, AB
	- La commessa di cucitura da la possibilità di versare un singolo lotto, qui quindi si inseriscono le dimensioni e al massimo si aggiornano 
	- Gli step roll non sono permessi
*/
declare @getdate DATETIME = getutcdate()
declare @exist int = isnull((select count(*) from dbo.order_merge_rows_return where IDcompany = @IDcompany and IDmerge = @IDmerge),0)
if (@exist = 0)  /* Se esiste aggionriamo solo */
begin
		--inserimento del lotto di versamento
		insert into dbo.order_merge_rows_return (IDcompany,IDmerge,PZ,LA,LU,ord_ref,step_roll,step_roll_order,IDlocation, date_ins) values 
		(@IDcompany,@IDmerge,@pz,@la,@lu,@ord_ref,0,0,@location, @getdate)
end
else
begin
		--inserimento del lotto di versamento
		update dbo.order_merge_rows_return
		set LA = @la, LU = @lu, PZ = @pz, ord_ref = @ord_ref, username = @username, IDlocation = @location, date_ins = @getdate
		where IDcompany = @IDcompany and IDmerge = @IDmerge
		
end

END;
GO
/****** Object:  StoredProcedure [dbo].[sp_order_production_add_component]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_order_production_add_component] (
@IDcompany int ,
@IDlot nvarchar(20),
@IDitem nvarchar (max),
@username nvarchar(35)
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
	declare @getdate DATETIME = getutcdate()
	-- **Testata - controllo se c'è già una testata, se non c'è la creo
	declare @checkHeader int = (select COUNT(*) from dbo.order_production where IDcompany = @IDcompany and IDlot = @IDlot)
	declare @H_IDwarehouse nvarchar (max) = ''
	declare @H_IDlocation nvarchar (max) = ''
	declare @H_qty float = 0
	if (@checkHeader = 0)
	begin
		select @H_IDwarehouse = sHead.IDwarehouse ,@H_IDlocation = sHead.IDlocation,  @H_qty = sHead.qty_stock
		from dbo.stock sHead where sHead.IDcompany = @IDcompany and sHead.IDlot = @IDlot
		insert into dbo.order_production (IDcompany,IDlot, username, IDwarehouse, IDlocation, qty, date_creation, executed) 
									values (@IDcompany,@IDlot,@username, @H_IDwarehouse, @H_IDlocation, @H_qty, @getdate, 0)
	end
	-- **Testata -

	--recupero il numero di ordine legato a questo lotto
	declare @IDord nvarchar (max) = (select IDord from order_production where IDlot = @IDlot and IDcompany = @IDcompany)
	/* se il componente è frazionabile setto il prelievo automatico, se invece non è frazionabile 
	setto il lotto specifico (per i non frazionabili gli utenti non possono selezionare auto anche da web) */
	declare @frazionabile bit = (select frazionabile from dbo.item inner join dbo.um on um.IDdim = item.um
								 where IDitem = @IDitem)
	if @frazionabile = 0 
	begin
		insert into [dbo].order_production_components		
		(IDord, IDcompany, IDitem, qty_expected, auto_lot, IDStock , qty, executed, username ) 		
		select @IDord, @IDcompany, @IDitem, 0, 0, null, 0, 0, @username
	end
	else
	begin
		insert into [dbo].order_production_components		
		(IDord, IDcompany, IDitem, qty_expected, auto_lot, IDStock, qty, executed, username ) 		
		select @IDord, @IDcompany, @IDitem, 0, 1, null, 0, 0, @username
	end

end;
GO
/****** Object:  StoredProcedure [dbo].[sp_order_production_confirm]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_order_production_confirm]
	@IDcompany [int],
	@IDlot [nvarchar](20),
	@username nvarchar (35)
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/* Logica di funzionamento:
Tabella order_production : testata ordine, 
Tabella order_production_components: contiene i record con i compoenti da consumare 
Il lotto sui cui vengono applicati i componenti viene mantenuto tale, cambia solo il valore
che viene aggiornato ad ogni compoentne aggiunto.
- 2020 04 08, aggiunto il campo lotto per la selezione specifica, non è necessario per il processo in 
			  se che utilizza l'IDstock, ma serve per scopo di analisi, non essendoci attualmente in link
			  diretto tra componenti cosumati da odp e transazioni (possibili prossimi sviluppi)
- 2020 04 08, Aggiunta inizializzazione delle variabili all'interno del ciclo, aggiunto anche nel caso
			  di lotto specifico, la verifica che l'IDstock selezionato dall'utente sia ancora "valido"
			  cioè che un altro utente non abbia movimentato la giacenza e che quindi quell'id non esista 
			  più.
*/
declare @NuovoLotto [nvarchar] (20)
declare @getdate DATETIME = getutcdate()
declare @IDord nvarchar (max) = (select o.IDord from dbo.order_production o where o.IDcompany = @IDcompany and o.IDlot = @IDlot)
declare @numer_of_comp int = isnull((select COUNT(*) from  dbo.order_production_components r 
									where r.IDcompany = @IDcompany and r.IDord = @IDord and r.executed = 0),0) 
							     -- leggo il numero di componenti inseriti (c'è anche la condizione dei record già eseguiti)
declare @current_comp nvarchar (max) = ''
declare @current_comp_IDitem nvarchar (max) 
declare @current_comp_auto_lot bit = 0
declare @current_comp_IDstock nvarchar (max) 
declare @current_comp_qty float 
declare @current_comp_lotToGetStock [nvarchar] (20)
declare @current_comp_lotToGetStock_qty float
declare @current_comp_lotToGetStock_um [nvarchar] (5)
declare @current_comp_lotToGetStock_loc nvarchar (max) 
declare @current_comp_lotToGetStock_UnitVal float

/* INIZIO CONSUMO LOTTO DA TAGLIARE (o lotti in caso di step roll) */
--1) Recupero informazioni per consumare lotto padre
declare @dad_mag nvarchar (max) = ''
declare @dad_qty float = 0
declare @dad_ValueUnit float = 0
declare @dad_ValueTotForUpComp float = 0  /* da mantenera diversa in quanto nella main_tran c'è una variabile simile */
select @dad_mag = s.IDwarehouse, @dad_qty = s.qty_stock, @dad_ValueUnit = lv.UnitValue
from dbo.stock s
inner join dbo.lot l on l.IDcompany = s.IDcompany and l.IDlot = s.IDlot
left outer join vw_lot_last_value lv on lv.IDcompany = s.IDcompany and lv.IDlot = s.IDlot 
where s.IDcompany = @IDcompany and s.IDlot = @IDlot
/* Calcolo il valore totale del lotto "principale, sotto aggiungo poi il valore di
ogni componente, e quando finisco la procedura aggiorno il valore del lotto padre */
set @dad_ValueTotForUpComp = @dad_qty * @dad_ValueUnit
/* INIZIO consumo dei componenti */
while @numer_of_comp <>  0
Begin
	
	--2020 04 08		
	set @current_comp = ''
	set @current_comp_IDitem = ''
	set @current_comp_auto_lot = null
	set @current_comp_IDstock = ''  
	set @current_comp_qty = 0  
	--seleziono un componente da gestire, per identificare quelli fatti selezioni quelli con il campo executed = 1 (bit)
	 select top 1 @current_comp = c.IDcomp , @current_comp_auto_lot = c.auto_lot, 
				@current_comp_IDstock = c.IDStock, @current_comp_qty = c.qty, @current_comp_IDitem = c.IDitem
	 from dbo.order_production_components c where c.IDcompany = @IDcompany and c.IDord = @IDord and c.executed = 0
	/* prelievo in automatico, ciclo fino a consumare la qty (il controllo che la qty ci sia viene effettuato in maschera,
	inoltre questi saranno tutti articoli frazionabili, in quanto quelli non frazionabili li obblighiamo a selezionare il lotto */
	if @current_comp_auto_lot = 1 
	begin 
			while @current_comp_qty <>  0 /*Fino a quando non consumo tutta la qty continuo a ciclare */
			begin
						select  top 1   /* 2020-04-24 Questo + l'order by "date_lot" sotto ci consente di consumare prima i lotto piu vecchi */
								@current_comp_lotToGetStock = sc.IDlot , 
								@current_comp_lotToGetStock_qty = sc.qty_stock, 
								@current_comp_lotToGetStock_um = sci.um, 
								@current_comp_lotToGetStock_loc = sc.IDlocation,
								@current_comp_lotToGetStock_UnitVal = ltV.UnitValue
						from dbo.stock sc 
						inner join		dbo.lot scl					on scl.IDcompany = sc.IDcompany and  scl.IDlot = sc.IDlot
						inner join		dbo.item sci				on sci.IDitem = scl.IDitem  
						left outer join dbo.vw_lot_last_value ltV	on ltV.IDcompany = sc.IDcompany and ltv.IDlot = sc.IDlot
						where sc.IDcompany = @IDcompany and scl.IDitem = @current_comp_IDitem and sc.IDwarehouse = @dad_mag
						order by scl.date_lot asc /* 2020-04-24 */
		
						/* Se la qty del lotto trovato è minore di 
						quella di cui abbiamo bisogno lo consumiamo interamente, decrementiamo poi la qty */
						if @current_comp_lotToGetStock_qty < @current_comp_qty 
						begin																
							/* Eliminazione\consumo dallo stock e scrittura del log nelle transazioni */
							exec dbo.sp_main_stock_transaction @IDcompany, @current_comp_lotToGetStock, @dad_mag, 
															@current_comp_lotToGetStock_loc, @current_comp_lotToGetStock_um,'-', 
															@current_comp_lotToGetStock_qty, 2, @username, '', null, @IDord
							/*descremento la qty che abbiamo appena consumato*/
							set @current_comp_qty = @current_comp_qty - @current_comp_lotToGetStock_qty
							/*Aggiorno il valore del lotto padre totale */
							set @dad_ValueTotForUpComp = (@dad_ValueTotForUpComp + (@current_comp_lotToGetStock_UnitVal * @current_comp_lotToGetStock_qty))
						end
						else
						begin
							/* Eliminazione\consumo dallo stock e scrittura del log nelle transazioni */
							exec dbo.sp_main_stock_transaction @IDcompany, @current_comp_lotToGetStock, @dad_mag, 
															@current_comp_lotToGetStock_loc, @current_comp_lotToGetStock_um,'-', 
															@current_comp_qty, 2, @username, '', null, @IDord	
							
							/*Aggiorno il valore del lotto padre totale */
							set @dad_ValueTotForUpComp = (@dad_ValueTotForUpComp + (@current_comp_lotToGetStock_UnitVal * @current_comp_qty))
							set @current_comp_qty = 0
						end
			  end
			  /* Segno che il componente è stato processato */
			  update dbo.order_production_components
			  set executed = 1
			  where IDcompany = @IDcompany and IDord = @IDord and IDcomp = @current_comp
	end
	else
	begin  /* @current_comp_auto_lot = 1, Qui abbiamo specificato l'IDstock in riga, andiamo a cosumare questo lotto\wh\loc specifica */
			
		  /* 2020 04 03, bugfix: veniva effettuato sempre il prelievo completo del lotto, ora utilizziamo la
			qty che è stata specificata sul form, solo nel caso di m2 consumiamo tutto */
		  /* 2020 04 08 */
			set @current_comp_lotToGetStock = ''
			set @current_comp_lotToGetStock_qty = null
			set @current_comp_lotToGetStock_um = null
			set @current_comp_lotToGetStock_loc = null
			set @current_comp_lotToGetStock_UnitVal = null
			select  @current_comp_lotToGetStock = sc.IDlot , 
					@current_comp_lotToGetStock_qty = sc.qty_stock, 
					@current_comp_lotToGetStock_um = sci.um, 
					@current_comp_lotToGetStock_loc = sc.IDlocation,
					@current_comp_lotToGetStock_UnitVal = ltV.UnitValue
			from dbo.stock sc 
			inner join dbo.lot scl on scl.IDcompany = sc.IDcompany and  scl.IDlot = sc.IDlot
			inner join dbo.item sci on sci.IDitem = scl.IDitem  
			left outer join dbo.vw_lot_last_value ltV	on ltV.IDcompany = sc.IDcompany and ltv.IDlot = sc.IDlot
			where sc.IDcompany = @IDcompany and sc.IDstock = @current_comp_IDstock /* ID univoco, identifica un singolo record */
			/* 2020 04 08, Controllo agg., verifichiamo che l'ID stock sia ancora effettivamente corretto, nel caso in cui altri abbiamo movimentato
			la giacenza del componente e quindi quell IDstock non esista più */
			if @current_comp_lotToGetStock <> '' 
			begin
				/* 2020 04 03, Controllo agg. sulla qty, se viene messa una qty maggiore di quella a stock 
				settiamo quella a stock */
				if @current_comp_qty > @current_comp_lotToGetStock_qty begin set @current_comp_qty = @current_comp_lotToGetStock_qty end 
	
				/* Eliminazione\consumo dallo stock e scrittura del log nelle transazioni */
				exec dbo.sp_main_stock_transaction @IDcompany, @current_comp_lotToGetStock, @dad_mag, 
												@current_comp_lotToGetStock_loc, @current_comp_lotToGetStock_um,'-', 
												/* @current_comp_lotToGetStock_qty, 2, @username, '', 0      2020 04 03, usiamo la qty specificata in pagina web */
												@current_comp_qty, 2, @username, '', null, @IDord
	
	
				/*Aggiorno il valore del lotto padre totale */
				/* 2020 09 11, Bugfix, il valore deve essere conteggiato sulla base dei componenti consumati, non del totale
				set @dad_ValueTotForUpComp = (@dad_ValueTotForUpComp +(@current_comp_lotToGetStock_UnitVal * @current_comp_lotToGetStock_qty)) */
				set @dad_ValueTotForUpComp = (@dad_ValueTotForUpComp +(@current_comp_lotToGetStock_UnitVal * @current_comp_qty)) 
				/* Segno che il componente è stato processato */
				update dbo.order_production_components
				set executed = 1
				where IDcompany = @IDcompany and IDord = @IDord and IDcomp = @current_comp
			end
	end
	set @numer_of_comp = @numer_of_comp - 1
end

--Aggiorno il valore del lotto padre considerando le applicazioni aggiunte (ho sommato ad ogni consumo)
if @dad_qty <> 0 
begin
	set @dad_ValueUnit = @dad_ValueTotForUpComp / @dad_qty
end else begin
	set @dad_ValueUnit = 0
end
exec dbo.sp_lot_value_add @IDcompany, @IDlot, @dad_ValueUnit, @username, 0, 'SYSTEM: Applications added'
-- Segno l'ordine di produzione come chiuso
update dbo.order_production 
set executed = 1, date_executed = @getdate 
where IDcompany = @IDcompany and IDord = @IDord

end;
GO
/****** Object:  StoredProcedure [dbo].[sp_order_production_confirm_20200218]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_order_production_confirm_20200218]
	@IDcompany [int],
	@IDlot [nvarchar](20),
	@username nvarchar (35)
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/* Logica di funzionamento:
Tabella order_production : testata ordine, 
Tabella order_production_components: contiene i record con i compoenti da consumare 
Il lotto sui cui vengono applicati i componenti viene mantenuto tale, cambia solo il valore
che viene aggiornato ad ogni compoentne aggiunto.
*/
declare @NuovoLotto [nvarchar] (20)
declare @getdate DATETIME = getdate()
declare @IDord bigint = (select o.IDord from dbo.order_production o where o.IDcompany = @IDcompany and o.IDlot = @IDlot)
declare @numer_of_comp int = isnull((select COUNT(*) from  dbo.order_production_components r 
									where r.IDcompany = @IDcompany and r.IDord = @IDord and r.executed = 0),0) 
							     -- leggo il numero di componenti inseriti (c'è anche la condizione dei record già eseguiti)
declare @current_comp int = 0
declare @current_comp_IDitem int 
declare @current_comp_auto_lot bit = 0
declare @current_comp_IDstock bigint 
declare @current_comp_qty float 
declare @current_comp_lotToGetStock [nvarchar] (20)
declare @current_comp_lotToGetStock_qty float
declare @current_comp_lotToGetStock_um [nvarchar] (5)
declare @current_comp_lotToGetStock_loc int 

/* INIZIO CONSUMO LOTTO DA TAGLIARE (o lotti in caso di step roll) */
--1) Recupero informazioni per consumare lotto padre
declare @dad_mag int = 0
declare @dad_loc int = 0
declare @dad_qty float = 0
declare @dad_StepRoll bit
declare @dad_StepRollDad nvarchar (20) = ''
declare @dad_StepRollNumber int = 0
declare @dad_StepRollLot nvarchar (20) = ''
declare @dad_StepRollLotQty float = 0
declare @dad_StepRollLotMag int = 0
declare @dad_StepRollLotLoc int = 0
declare @dad_value float = 0
declare @dad_checked_value bit 
declare @dad_checked_value_date DATETIME
declare @dad_devaluation int
select @dad_mag = s.IDwarehouse, @dad_loc = s.IDlocation, @dad_qty = s.qty_stock,  @dad_StepRoll = l.stepRoll, /* In caso di step roll consumo tutti i lotti legati */
@dad_StepRollDad = l.IDlot_padre, @dad_checked_value = l.checked_value, @dad_devaluation = l.devaluation, @dad_checked_value_date = checked_value_date
from dbo.stock s
inner join dbo.lot l on l.IDcompany = s.IDcompany and l.IDlot = s.IDlot
where s.IDcompany = @IDcompany and s.IDlot = @IDlot


/* INIZIO consumo dei componenti */
while @numer_of_comp <>  0
Begin
	/* VERIFICARE SE IL CAMPO "IDLOT" SERVA O SE BASTA l'idstock */
	--seleziono un componente da gestire, per identificare quelli fatti selezioni quelli con il campo executed = 1 (bit)
	 select top 1 @current_comp = c.IDcomp , @current_comp_auto_lot = c.auto_lot, 
				@current_comp_IDstock = c.IDStock, @current_comp_qty = c.qty, @current_comp_IDitem = c.IDitem
	 from dbo.order_production_components c where c.IDcompany = @IDcompany and c.IDord = @IDord and c.executed = 0
	/* prelievo in automatico, ciclo fino a consumare la qty (il controllo che la qty ci sia viene effettuato in maschera,
	inoltre questi saranno tutti articoli frazionabili, in quanto quelli non frazionabili li obblighiamo a selezionare il lotto */
	if @current_comp_auto_lot = 1 
	begin 
			while @current_comp_qty <>  0 /*Fino a quando non consumo tutta la qty continuo a ciclare */
			begin
						select  @current_comp_lotToGetStock = sc.IDlot , 
								@current_comp_lotToGetStock_qty = sc.qty_stock, 
								@current_comp_lotToGetStock_um = sci.um, 
								@current_comp_lotToGetStock_loc = sc.IDlocation
						from dbo.stock sc 
						inner join dbo.lot scl on scl.IDcompany = sc.IDcompany and  scl.IDlot = sc.IDlot
						inner join dbo.item sci on sci.IDitem = scl.IDitem  
						where sc.IDcompany = @IDcompany and scl.IDitem = @current_comp_IDitem and sc.IDwarehouse = @dad_mag
		
						/* Se la qty del lotto trovato è minore di 
						quella di cui abbiamo bisogno lo consumiamo interamente, decrementiamo poi la qty */
						if @current_comp_lotToGetStock_qty < @current_comp_qty 
						begin																
							/* Eliminazione\consumo dallo stock e scrittura del log nelle transazioni */
							exec dbo.sp_main_stock_transaction @IDcompany, @current_comp_lotToGetStock, @dad_mag, 
															@current_comp_lotToGetStock_loc, @current_comp_lotToGetStock_um,'-', 
															@current_comp_lotToGetStock_qty, 2, @username, '', 0
							/*descremento la qty che abbiamo appena consumato*/
							set @current_comp_qty = @current_comp_qty - @current_comp_lotToGetStock_qty
						end
						else
						begin
							/* Eliminazione\consumo dallo stock e scrittura del log nelle transazioni */
							exec dbo.sp_main_stock_transaction @IDcompany, @current_comp_lotToGetStock, @dad_mag, 
															@current_comp_lotToGetStock_loc, @current_comp_lotToGetStock_um,'-', 
															@current_comp_qty, 2, @username, '', 0		
							set @current_comp_qty = 0
						end
			  end
	end
	else
	begin  /* @current_comp_auto_lot = 1, Qui abbiamo specificato l'IDstock in riga, andiamo a cosumare questo lotto\wh\loc specifica */
			select  @current_comp_lotToGetStock = sc.IDlot , 
					@current_comp_lotToGetStock_qty = sc.qty_stock, 
					@current_comp_lotToGetStock_um = sci.um, 
					@current_comp_lotToGetStock_loc = sc.IDlocation
			from dbo.stock sc 
			inner join dbo.lot scl on scl.IDcompany = sc.IDcompany and  scl.IDlot = sc.IDlot
			inner join dbo.item sci on sci.IDitem = scl.IDitem  
			where sc.IDcompany = @IDcompany and sc.IDstock = @current_comp_IDstock /* ID univoco, identifica un singolo record */
			/* Eliminazione\consumo dallo stock e scrittura del log nelle transazioni */
			exec dbo.sp_main_stock_transaction @IDcompany, @current_comp_lotToGetStock, @dad_mag, 
											@current_comp_lotToGetStock_loc, @current_comp_lotToGetStock_um,'-', 
											@current_comp_lotToGetStock_qty, 2, @username, '', 0
	end

	
	/* Segno che il componente è stato processato */
    update dbo.order_production_components
	set executed = 1
	where IDcompany = @IDcompany and IDord = @IDord and IDcomp = @current_comp
	set @numer_of_comp = @numer_of_comp - 1
end
-- Segno l'ordine di produzione come chiuso
update dbo.order_production 
set executed = 1, date_executed = @getdate 
where IDcompany = @IDcompany and IDlot = @IDlot

end;
GO
/****** Object:  StoredProcedure [dbo].[sp_order_split_confirm]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_order_split_confirm]
	@IDcompany [int], 	
	@IDstock nvarchar (max),			
	@username nvarchar (35)
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/* 2020-04-08 Il testo lotto del padre viene riportato nel figlio */

declare @IDlot [nvarchar] (20)  /* Lotto "padre */
declare @NuovoLotto [nvarchar] (20)
declare @getdate DATETIME = getutcdate()
declare @qty float = 0
declare @numer_of_splits int = 0
declare @IDord nvarchar (max) = ''

select @numer_of_splits = COUNT(*) OVER (),   /* Conteggio dei record da processare */
	   @IDord = o.IDord,						  /* ID dell'ordine */
	   @IDlot = o.IDlot
from dbo.order_split o
inner join dbo.order_split_row op on o.IDcompany = op.IDcompany and o.IDord = op.IDord
where o.IDcompany = @IDcompany and IDstock = @IDstock
declare @current_split int = 0
declare @current_qty float = 0
declare @item nvarchar (max) = ''
declare @lot_origine [nvarchar] (20) = ''
declare @loc nvarchar (max) = ''
declare @ord_rif nvarchar(100) = ''

/* INIZIO CONSUMO LOTTO DA TAGLIARE (o lotti in caso di step roll) */
--1) Recupero informazioni per consumare lotto padre
declare @dad_mag nvarchar (max) = ''
declare @dad_loc nvarchar (max) = ''
declare @dad_qty float = 0
declare @dad_value float = 0
declare @dad_checked_value bit 
declare @dad_checked_value_date DATETIME
declare @dad_devaluation nvarchar (max) = ''
declare @dad_eur1 bit
declare @dad_conf_item bit
declare @dad_note nvarchar(200) = ''
declare @dad_um nvarchar(3) = ''
declare @LA float
declare @LU float
declare @PZ float
declare @DE float
declare @DI float
select @dad_mag = s.IDwarehouse, @dad_loc = s.IDlocation, @dad_qty = s.qty_stock, 
@dad_checked_value = l.checked_value, @dad_devaluation = l.devaluation, @item = l.IDitem,
@dad_checked_value_date = checked_value_date, @dad_eur1 = eur1, @dad_conf_item = l.conf_item, @dad_note = l.note, @dad_um = i.um
from dbo.stock s
inner join dbo.lot l on l.IDcompany = s.IDcompany and l.IDlot = s.IDlot
inner join dbo.item i on i.IDitem = l.IDitem
where s.IDcompany = @IDcompany and s.IDstock = @IDstock

--2) Eliminazione dallo stock (ATTENZIONE, qui possiamo trovare lo stesso lotto su più magazzini, dobbiamo consumare solo quello selezionato), Scrittura del log nelle transazioni
exec dbo.sp_main_stock_transaction @IDcompany, @IDlot, @dad_mag, @dad_loc, @dad_um,'-', @dad_qty, 2, @username, '', null,null

/* INIZIO INSERIMENTO split DICHIARATI: ciclo per ogni split inserito */
while @numer_of_splits <>  0
Begin
	set @LA = 0
	set @LU = 0
	set @PZ = 0
	set @DE = 0
	set @DI = 0
	--seleziono il taglio da gestire, per identificare quelli fatti selezioni quelli con il campo IDlot_new vuoto
	 select top 1 @current_split = IDRowSplit, @current_qty = qty_split, @loc = IDlocation, @ord_rif = ord_ref
	 from dbo.order_split_row r where r.IDcompany = @IDcompany and r.IDord = @IDord and isnull(IDlot_new,'') = ''
	--inserimento del lotto in anagrafica lotti
	/*
	set @NuovoLotto = (select gen_cod_lot.lot_code + gen_cod_lot.IDcountry + gen_cod_lot.IDlotType + gen_cod_lot.year_number + gen_cod_lot.seriale
					   from dbo.vw_GeneraCodiciLottoPerCompany gen_cod_lot
					   inner join dbo.warehouse wh on wh.IDcompany = gen_cod_lot.IDcompany and wh.IDcountry = gen_cod_lot.IDcountry
					   where gen_cod_lot.IDcompany = @IDcompany 
					   and   IDlotType = 'V' 
					   and   wh.IDwarehouse = @mag) */
	DECLARE @NEW_lotCode nvarchar(20)
	EXEC sp_generateNewLotCode @IDcompany,@dad_mag,'F', @NEW_lotCode OUTPUT
	SELECT @NuovoLotto = @NEW_lotCode 
	
	--Inserisco il nuovo lotto generato nella tabella dei tagli (in modo da non selezionarlo al prossimo ciclo)
	update dbo.order_split_row set IDlot_new = @NuovoLotto where IDcompany = @IDcompany and IDRowSplit = @current_split
	-- Gestione delle dimensioni, qui arrivano articoli gestini a "N" e a "m", nella gestione della pagina facciamo 
	-- inserire solo la "qty" a magazzino, qui, sulla base dell'UM "convertiamo la qty in dim supportate dall'um.
	if(@dad_um = 'm')
	begin
		set @LU = (@current_qty * 1000)
	end
	if(@dad_um = 'N' and @dad_um = 'kg')
	begin
		set @PZ = @current_qty 
	end
	if(@dad_um = 'NP')
	begin
		select @DE = pv.DE, @DI = pv.DI
		from [dbo].[vw_lotDimensionsPivot] pv where pv.IDcompany = @IDcompany and pv.IDlot = @IDlot
		set @PZ = @current_qty 
	end
	--Inserimento lotto in anagafica lotti /* verificare lotto padre ecc  ------------------------------------------*/	
	set @lot_origine = (select IDlot_origine from lot where IDcompany = @IDcompany and IDlot = @IDlot)					
	exec dbo.sp_lotInserimento @IDcompany, @NuovoLotto, @item, @getdate, @getdate, @IDlot, @lot_origine,'', null, @dad_note, '', '',  @DE,@DI,@LA,@LU,@PZ, 
	@dad_checked_value, @dad_devaluation, @ord_rif, @dad_checked_value_date, @dad_eur1, @dad_conf_item, 0, 2, @IDord
	/* Inserimento valore lotto, il valore all'unità la copiamo da lotto "padre" */	
	select @dad_value = lv.UnitValue
	from vw_lot_last_value lv where lv.IDcompany = @IDcompany and lv.IDlot = @IDlot
	exec dbo.sp_lot_value_add @IDcompany, @NuovoLotto, @dad_value, @username, 0, ''
	-- Inserimento lotto in stock e nelle transazioni (il checked è preso dal padre, e viene gestito quando viene creato il lotto)
	exec dbo.sp_main_stock_transaction @IDcompany, @NuovoLotto, @dad_mag, @loc, @dad_um,'+', @current_qty, 2, @username, @ord_rif, null,null
	set @numer_of_splits = @numer_of_splits - 1
end
-- Segno la commessa di taglio come eseguita
update dbo.order_split set executed = 1, date_executed = @getdate where IDcompany = @IDcompany and IDord = @IDord
end;
GO
/****** Object:  StoredProcedure [dbo].[sp_renamediagram]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_renamediagram]
	(
		@diagramname 		sysname,
		@owner_id		int	= null,
		@new_diagramname	sysname
	
	)
	WITH EXECUTE AS 'dbo'
	AS
	BEGIN
		set nocount on
		declare @theId 			int
		declare @IsDbo 			int
		
		declare @UIDFound 		int
		declare @DiagId			int
		declare @DiagIdTarg		int
		declare @u_name			sysname
		if((@diagramname is null) or (@new_diagramname is null))
		begin
			RAISERROR ('Invalid value', 16, 1);
			return -1
		end
	
		EXECUTE AS CALLER;
		select @theId = DATABASE_PRINCIPAL_ID();
		select @IsDbo = IS_MEMBER(N'db_owner'); 
		if(@owner_id is null)
			select @owner_id = @theId;
		REVERT;
	
		select @u_name = USER_NAME(@owner_id)
	
		select @DiagId = diagram_id, @UIDFound = principal_id from dbo.sysdiagrams where principal_id = @owner_id and name = @diagramname 
		if(@DiagId IS NULL or (@IsDbo = 0 and @UIDFound <> @theId))
		begin
			RAISERROR ('Diagram does not exist or you do not have permission.', 16, 1)
			return -3
		end
	
		-- if((@u_name is not null) and (@new_diagramname = @diagramname))	-- nothing will change
		--	return 0;
	
		if(@u_name is null)
			select @DiagIdTarg = diagram_id from dbo.sysdiagrams where principal_id = @theId and name = @new_diagramname
		else
			select @DiagIdTarg = diagram_id from dbo.sysdiagrams where principal_id = @owner_id and name = @new_diagramname
	
		if((@DiagIdTarg is not null) and  @DiagId <> @DiagIdTarg)
		begin
			RAISERROR ('The name is already used.', 16, 1);
			return -2
		end		
	
		if(@u_name is null)
			update dbo.sysdiagrams set [name] = @new_diagramname, principal_id = @theId where diagram_id = @DiagId
		else
			update dbo.sysdiagrams set [name] = @new_diagramname where diagram_id = @DiagId
		return 0
	END;
GO
/****** Object:  StoredProcedure [dbo].[sp_ricevimento_acquisto]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_ricevimento_acquisto]
	
	@IDcompany [int],
	@ord_riferimento [nvarchar](100),
	@lot_fornitore [nvarchar](20),
	@lot_data [datetime],
	@lot_val [float],
	@mag nvarchar (max),
	@loc nvarchar (max),
	@item nvarchar (max),
	@DE [float],
	@DI [float],
	@LA [float], 
	@LU [float],
	@PZ [float],	
	@username [nvarchar] (35),
	@um [nvarchar] (5),
	@IDsupplier nvarchar (max),
	@eur1 [bit],
	@conf_item [bit],  /*AB, 2023-01-02*/
	
	@lot_txt [nvarchar](200),		/*2021-04-06*/
	@delivery_note [nvarchar](200)  /*2021-04-06*/
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
declare @NuovoLotto [nvarchar] (20)
declare @getdate DATETIME = getutcdate()
declare @qty float = 0
declare @lot_val_u float = 0
set @lot_fornitore = UPPER(@lot_fornitore)
/* Generazione codice lotto in base i dati passati (logica di generazione presente sulla vista */
/* AB, 2018 10 29 utilizzo dell'sp che salva i numeri primi
set @NuovoLotto = (select gen_cod_lot.lot_code + gen_cod_lot.IDcountry + gen_cod_lot.IDlotType + gen_cod_lot.year_number + gen_cod_lot.seriale
				   from dbo.vw_GeneraCodiciLottoPerCompany gen_cod_lot
				   inner join dbo.warehouse wh on wh.IDcompany = gen_cod_lot.IDcompany and wh.IDcountry = gen_cod_lot.IDcountry
				   where gen_cod_lot.IDcompany = @IDcompany 
				   and   IDlotType = 'A' 
				   and   wh.IDwarehouse = @mag) */ 
BEGIN TRY    
	BEGIN TRANSACTION
		DECLARE @NEW_lotCode nvarchar(20)
		EXEC sp_generateNewLotCode @IDcompany,@mag,'A', @NEW_lotCode OUTPUT
		SELECT @NuovoLotto = @NEW_lotCode 
	
		/* Inserimento lotto in anagrafica lotti */
		exec dbo.sp_lotInserimento @IDcompany, @NuovoLotto, @item, @getdate, @lot_data, @NuovoLotto, @NuovoLotto, @lot_fornitore,  @IDsupplier, @lot_txt, 0,0, 
		@DE,@DI,@LA,@LU,@PZ, 0, 0, @ord_riferimento,'', @eur1, @conf_item, 0, 1, null
	
		/* Calcolo delle qty in base all'um di gestione magazzino */
		set @qty = dbo.calcQtyFromDimensionByUM(@um, @LA,@LU,@PZ,@DI,@DE)
	
		/* Inserimento valore lotto */
		if (@lot_val = 0) begin 
			set @lot_val_u = 0
		end else begin
			set @lot_val_u = @lot_val / @qty
		end
	
		exec dbo.sp_lot_value_add @IDcompany, @NuovoLotto, @lot_val_u, @username, 0, ''
	 
		-- Inserimento lotto in stock e nelle transazioni 
		exec dbo.sp_main_stock_transaction @IDcompany, @NuovoLotto, @mag, @loc, @um,'+', @qty, 1, @username, @ord_riferimento, @IDsupplier, null
	
		-- Inserimento ricevimento (tabella dedicata con rif. nota di consegna)
		insert into [dbo].[receptions] (IDcompany,
IDlot,
IDlot_fornitore,
date_rec,
qty,
username,
IDbp,
ord_rif,
delivery_note)
		select @IDcompany, @NuovoLotto, @lot_fornitore, @getdate, @qty, @username, @IDsupplier, @ord_riferimento, @delivery_note
	
	    COMMIT
	    SELECT 1 as response
END TRY
BEGIN CATCH    
	ROLLBACK 
	INSERT INTO dbo.logs (IDcompany,
username,
date,
vars,
errors)
	select @IDcompany, @username, GETDATE(), 
	/*Input parameters*/
	concat
	(@IDcompany, ' | ',
	@ord_riferimento, ' | ',
	@lot_fornitore, ' | ',
	@lot_data, ' | ',
	@lot_val, ' | ',
	@mag, ' | ',
	@loc, ' | ',
	@item, ' | ',
	@DE, ' | ',
	@DI, ' | ',
	@LA, ' | ',
	@LU, ' | ',
	@PZ, ' | ',
	@username, ' | ',
	@um, ' | ',
	@IDsupplier, ' | ',
	@eur1, ' | ',
	@conf_item, ' | ',
	@lot_txt, ' | ',
	@delivery_note
	),
	
	/*DB errors details*/
	concat
	('user: ', SUSER_SNAME(), ' | ',
	'err. num.: ', ERROR_NUMBER(), ' | ',
	'err. state: ', ERROR_STATE(), ' | ',
	'err. sever.: ', ERROR_SEVERITY(), ' | ',
	'err. line: ', ERROR_LINE(), ' | ',
	'err. proced.: ', ERROR_PROCEDURE(), ' | ',
	'err. message: ', ERROR_MESSAGE(),' | '
	)
	
	SELECT 0 as response
END CATCH
	
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_stock_filter_add]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_stock_filter_add] (
@username nvarchar(35), 
@filter_desc nvarchar(1000),
@IDitem nvarchar (max) ,
@item_gr nvarchar(10),
@IDwh nvarchar (max),
@IDwhl nvarchar (max)
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN

insert into dbo.users_stock_filter (username, filter_desc, IDitem, item_group, IDwarehouse, IDlocation) 
select @username, @filter_desc, @IDitem,@item_gr, @IDwh, @IDwhl

end;
GO
/****** Object:  StoredProcedure [dbo].[sp_stock_filter_delete]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_stock_filter_delete]
	@user nvarchar(35),
	@IDfilter [int]
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN

--eliminazione del filtro 
/* L'utente dovrebbe essere superfluo ... */
delete from dbo.users_stock_filter where username = @user and IDfilter = @IDfilter

END;
GO
/****** Object:  StoredProcedure [dbo].[sp_stock_filter_enable]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create PROCEDURE [dbo].[sp_stock_filter_enable]
	@user nvarchar(35),
	@IDfilter [int]
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN

/* L'utente dovrebbe essere superfluo ... */
update dbo.users_stock_filter --disabilito tutto
set filter_enable = 0
where username = @user
update dbo.users_stock_filter  --abilito tutto
set filter_enable = 1
where username = @user and IDfilter = @IDfilter
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_sync_from_erpln_db_log]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
----------------------------------------------------------------------------------------------
-- Create Date   : 08/09/2022
--
-- Update Date	 : 
--
-- Author		 : Marco Brevi - Inoma
--
-- Description   : Log della sincronizzazione delle tabelle da ERPLN DB
--				   Nella yabella di log [dbo].[log_sync_erplndb]
--				    
----------------------------------------------------------------------------------------------- 
CREATE PROCEDURE [dbo].[sp_sync_from_erpln_db_log] (		@table_name           nvarchar(256)='???',
														@table_name_source    nvarchar(256)='???',
														
														@select_count  int=0,
														@delete_count  int=0,
														@insert_count  int=0,
														
														@sync_code     int=0,
														@sync_msg      nvarchar(2048)='???',
														@sync_errmsg   nvarchar(2048)='???',
														@sync_start    datetime=GetDate
														)
AS
BEGIN
  ---------------------------------------------------------
  -- SETTING
  --------------------------------------------------------- 
  SET NOCOUNT ON;
  -- Allow procedure to continue after error
  SET XACT_ABORT OFF 
  ---------------------------------------------------------
  -- Calcola esito in caso di errore
  ---------------------------------------------------------
  if (@select_count != @insert_count) OR (@sync_code != 0) OR (@sync_errmsg  != '')
  begin
   if   @sync_code  = 0 set  @sync_code = -1 -- Errore generico
   set  @sync_msg= '[ERROR] (' + cast(@sync_code as nvarchar) + ') - COUNT:' + cast(@select_count as nvarchar) + ' - INSERT: ' + cast(@insert_count as nvarchar) + ' - ERROR:' + cast( @sync_code  as nvarchar)
  end
  ---------------------------------------------------------
  -- Calcola esito in caso di OK
  ---------------------------------------------------------
  else 
  BEGIN
    if (@select_count =0) 
      set @sync_msg= ' [OK] : Zero rows to sync (0) '   
	else
	  set @sync_msg= ' [OK] : Inserted rows: ('  + cast(@insert_count  as nvarchar)  +')'
  END
  ---------------------------------------------------------
  -- Inserisce in tabella
  ---------------------------------------------------------
  INSERT INTO [dbo].[log_sync_erplndb]
  VALUES
           (GETDATE()
		   ,@table_name
		   ,@table_name_source
           ,@sync_msg
		   ,@sync_errmsg
           ,@sync_code  
           ,@select_count
		   ,@delete_count
		   ,@Insert_count
		   ,DateDiff(second,GETDATE(),@sync_start)
            )
 
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_upgraddiagrams]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_upgraddiagrams]
	AS
	BEGIN
		IF OBJECT_ID(N'dbo.sysdiagrams') IS NOT NULL
			return 0;
	
		CREATE TABLE dbo.sysdiagrams
		(
			name sysname NOT NULL,
			principal_id int NOT NULL,	-- we may change it to varbinary(85)
			diagram_id int PRIMARY KEY IDENTITY,
			version int,
	
			definition varbinary(max)
			CONSTRAINT UK_principal_name UNIQUE
			(
				principal_id,
				name
			)
		);

		/* Add this if we need to have some form of extended properties for diagrams */
		/*
		IF OBJECT_ID(N'dbo.sysdiagram_properties') IS NULL
		BEGIN
			CREATE TABLE dbo.sysdiagram_properties
			(
				diagram_id int,
				name sysname,
				value varbinary(max) NOT NULL
			)
		END
		*/
		IF OBJECT_ID(N'dbo.dtproperties') IS NOT NULL
		begin
			insert into dbo.sysdiagrams
			(
				[name],
				[principal_id],
				[version],
				[definition]
			)
			select	 
				convert(sysname, dgnm.[uvalue]),
				DATABASE_PRINCIPAL_ID(N'dbo'),			-- will change to the sid of sa
				0,							-- zero for old format, dgdef.[version],
				dgdef.[lvalue]
			from dbo.[dtproperties] dgnm
				inner join dbo.[dtproperties] dggd on dggd.[property] = 'DtgSchemaGUID' and dggd.[objectid] = dgnm.[objectid]	
				inner join dbo.[dtproperties] dgdef on dgdef.[property] = 'DtgSchemaDATA' and dgdef.[objectid] = dgnm.[objectid]
				
			where dgnm.[property] = 'DtgSchemaNAME' and dggd.[uvalue] like N'_EA3E6268-D998-11CE-9454-00AA00A3F36E_' 
			return 2;
		end
		return 1;
	END;
GO
/****** Object:  StoredProcedure [dbo].[sp_user_add]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_user_add] (
@username nvarchar(35),
@IDcompany int,
@IDgroup int,
@IDwarehouseUserDef int,
@Timezone nvarchar(100),
@dec nvarchar(1),
@sep nvarchar(1)
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/* 2020 01 24, al momento non gestiona il language, default en */
declare @utenteEsistente int = (select COUNT(*) from dbo.users where username = @username)
if @utenteEsistente = 0	
begin
	insert into [dbo].[users]([IDcompany],[username],[IDgroup],[language],[IDwarehouseUserDef],[clientTimezoneDB], [decimal_symb], [list_separator])
	select @IDcompany, @username, @IDgroup,'en', @IDwarehouseUserDef, @Timezone, @dec, @sep 
end
else
begin
	exec [dbo].[sp_user_details_update] @username, @IDcompany, @IDgroup, @IDwarehouseUserDef, @Timezone, @dec, @sep
end
end;
GO
/****** Object:  StoredProcedure [dbo].[sp_user_details_update]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_user_details_update] (
@username nvarchar(35),
@IDcompany int,
@IDgroup int,
@IDwarehouseUserDef int,
@Timezone nvarchar(100),
@dec nvarchar(1),
@sep nvarchar(1)
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
update [dbo].[users]
set  IDcompany = @IDcompany, IDgroup = @IDgroup, IDwarehouseUserDef = @IDwarehouseUserDef, clientTimezoneDB = @Timezone, decimal_symb = @dec, list_separator = @sep
where username = @username
end;
GO
/****** Object:  StoredProcedure [dbo].[sp_WAC_ADD_LAY_add_year_layer]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_WAC_ADD_LAY_add_year_layer] (@IDcompany int ,@username nvarchar(35), @year smallint)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/* 
EXAMPLE: exec [dbo].[sp_WAC_ADD_LAY_add_year_layer]  845, 'boggiani', '2020' 
DESCRIPTION:
Questa è la funzione che genera gli strati su base annua\articolo per il calcolo del costo medio ponderato di acquisto,
qui sono 2 casistiche
1)L'articolo che è da stratificare non ha starti precendenti, questo significa che è il primo anno che viene "acquistato",
in questo caso si esegue il calcolo puntuale, cioè stock totale a fine anno e valore totale (somma valore lotti) a fine anno.
2) L'articolo che è da stratificare ha strati negli anni precedenti e quindi ci appoggiamo a quelli + la media ponderata
degli acquisti per calcolare lo strato successivo.
AVG_COST(costo medio ponderato di acq)= (prec_stock_value + purchased_value) / (prec_stock + purchased_stock)
Esempio del caso 2
- Articolo NA30
- Siamo a gennaio 2022
- L'articolo nello strato 2020 aveva una giacenza finale di 200 m2 al volore di 18000 euro
- Dobbiamo creare lo strato 2021
- Durante il 2021 sono stati acquistati 150 m2 di NA30 per un valore totale (quindi somma delle fatture di acq) di 15000 euro
il calcolo finale per l'AVG_COST di questo articolo sarà (18000+15000)/(200+150) = 15350 euro

2023-01-04, AB, aggiunto il dettaglio per i lotti "configurati"
*/

	declare @getdate DATETIME = getutcdate()
	declare @exists int = isnull((select COUNT(*) from WAC_year_layers where [IDcompany] = @IDcompany and [year_layer] = @year),0)
	/*
	Creazione e o aggiornamento delle testata: non usiamo l'ID, ci appoggiamo semplicemente all'anno 
	che diventa chiave univoca.
	*/	
	if @exists = 0
	begin
			insert into WAC_year_layers([IDcompany] ,[username],[date_calc] ,[year_layer])
			select  @IDcompany, @username, @getdate, @year				
	end else begin
			/*E' un ricalcolo, quindi 
			1) Aggiorniamo in testata i dati di esecuzione
			2) Eliminiamo i record inseriti nell'esecuzione precedente */
			update WAC_year_layers
			set [username] = @username, [date_calc] = @getdate
			where [IDcompany] = @IDcompany and [year_layer] = @year
			delete from WAC_year_layers_item_detail where IDcompany = @IDcompany and year_layer = @year
	end
		
	/* ARTICOLI SENZA LAYER PRECENDENTI
	Inserimento di tutti gli strati che NON hanno uno strato presente nell'anno precedente,
	in questo caso faremo il calcolo "ACTUAL", cioò prenderemo la gianceza puntuale a fine anno e il valore puntuale a fine anno
	senza media degli acquisti */
	insert into dbo.WAC_year_layers_item_detail
				  ([IDcompany],[IDitem],[item],
				  conf_item, --2023-01-04
				  [year_layer],purchasedQty_on_the_year 
				  ,purchasedItemValue_on_the_year
				  ,[stock_qty_start_year]
				  ,[stock_value_start_year]
				  ,[stock_qty_end_year]
				  ,[stock_value_end_year]
				  ,[wac_avg_cost]) 
					/* Creazione dei primi strati usando la qty puntuale e il valore puntuale di fine anno,
					sostanzialmente prendiamo tutti gli articoli che non sono stati movimentati a li aggiungiamo*/
					select  @IDcompany, wac.IDitem, i.item, wac.conf_item, @year,0,0,0,0
										
					,sum(qty)				--Qty totale della somma dei lotti a giacenza di quell'articolo a fine anno
					,sum(qty*UnitValue)		--Valore (puntuale dei lotti, il primo val <> 0 inserito) totale della somma dei lotti a giacenza di quell'articolo a fine anno
					--,sum(UnitValue/qty)		--2022-01-25 avg cost
					,sum(qty*UnitValue)/sum(qty) --2022-07-14 AB, FIX, avg cost calcolato in modo errato sul primo layer
					from [dbo].[parView_WAC_ADD_LAY_stock_QtyValue_on_year_end] (@IDcompany, @year) wac
					inner join item i on wac.IDitem = i.IDitem
					
					/* Questa vista serve per calcolare solo gli articoli che non hanno "layer" di anni precedenti, quindi escludioamo 
					tutti gli articoli che sono già presenti nel dettaglio */
					left outer join WAC_year_layers_item_detail wacO on wacO.IDcompany = @IDcompany and wac.IDitem = wacO.IDitem and wac.conf_item = wacO.conf_item
					
					where --@IDcompany = @IDcompany INUTILE, LA VIEW PARAMETRIA ESTRAE SOLO QUELLI DELLA COMPANY SELEZIONATA
					
					wacO.IDitem is null  -- Per escludere tutti quelli già presenti
					
					group by wac.IDitem, i.item, wac.conf_item


	/* ARTICOLI CON LAYER PRECENDENTI
	QUINDI DA ESEGUIRE IL CALCOLO DEL COSTO MEDIO PONDERATO e da recuperare i valori di "inizio" anno che
	coincidono con quelli di fine dell'anno precedente */
	insert into dbo.WAC_year_layers_item_detail
				  ([IDcompany],[IDitem],[item],conf_item, --2023-01-04
				  [year_layer],purchasedQty_on_the_year 
				  ,purchasedItemValue_on_the_year
				  ,[stock_qty_start_year]
				  ,[stock_value_start_year]
				  ,[stock_qty_end_year]
				  ,[stock_value_end_year]
				  ,[wac_avg_cost]) 	
	/* Questa vista è una parte della parametric view "parView_WAC_main" che ha dei dati un più che qui non servono */
	select  @IDcompany, wacl.IDitem, wacl.item, wacl.conf_item, @year
	  		
			,isnull(purchasedQty,0), isnull(purchasedItemValue,0)   /* Qty\valori acquistati nell'anno di esecuzione */
			  /* Copia della QTY dell'anno precedente (che è quello in selezione ...), 
			  non viene "usata" ma è un aiuto a identicare i layer che sono calcolati in "ACTUAL" che hanno questi valori a zero */	   
		   ,isnull(wacl.stock_qty_end_year,0)
					
			  /* Copia del VALORE dell'anno precedente (che è quello in selezione ...), 
			  non viene "usata" ma è un aiuto a identicare i layer che sono calcolati in "ACTUAL" che hanno questi valori a zero */			     
		   ,isnull(wacl.stock_value_end_year ,0)  
		   ,cast(
				isnull(stock.qty_stock,0)
				 as decimal(18,2))--qty_stock
		   ,cast(
		   case when (wacl.stock_qty_end_year + isnull(purchasedQty,0)) = 0 then 0
				else
		        isnull(stock.qty_stock,0) * (wacl.stock_value_end_year + isnull(purchasedItemValue,0)) / (wacl.stock_qty_end_year + isnull(purchasedQty,0)) 
		    end as decimal(18,2)) --avg_cost 
		   ,case 
				when (wacl.stock_qty_end_year + isnull(purchasedQty,0)) = 0 then wacl.[wac_avg_cost]  /*se non abbiamo stock a fine hanno e non abbiamo acq. prediamo il costo medio prec.*/
				else
				(wacl.stock_value_end_year + isnull(purchasedItemValue,0)) / (wacl.stock_qty_end_year + isnull(purchasedQty,0))	--avg_cost
		   end
	from WAC_year_layers_item_detail wacl
	
	left outer join [dbo].[parView_WAC_stock_purchase_transaction_group_by_item] (@IDcompany, 
																	cast(cast(@year as varchar(4)) + '-01-01 00:00:00.000' as datetime),  /* Primo giorno dell'anno */
																	cast(cast(@year as varchar(4)) + '-12-31 23:59:59.000' as datetime))  /* Ultimo giorno dell'anno */
																	purch on purch.IDitem = wacl.IDitem	
																		  and purch.conf_item = wacl.conf_item --2023-01-04
	left outer join [dbo].[parView_WAC_stock_transaction_group_by_item](@IDcompany, cast(cast(@year as varchar(4)) + '-12-31 23:59:59.000' as datetime)) stock on stock.IDitem = wacl.IDitem
																																							and stock.conf_item = wacl.conf_item 		
	
	where wacl.IDcompany = @IDcompany	
	and wacl.year_layer = @year - 1 /* Qui il calcolo viene fatto con i valori del fine anno precedente sommando tutti gli acq. dell'anno selezionato */				  					
end;
GO
/****** Object:  StoredProcedure [dbo].[sp_WAC_set_layer_definitive]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_WAC_set_layer_definitive] (@IDcompany int ,@year smallint)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
update [dbo].[WAC_year_layers] 
set definitive = 1, date_definitive = GETUTCDATE()
where IDcompany = @IDcompany and year_layer = @year
	  					
end;
GO
/****** Object:  StoredProcedure [dbo].[sp_webpage_add]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create PROCEDURE [dbo].[sp_webpage_add] (
@page_desc nvarchar(100)
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
	insert into [dbo].users_pg_perm_pages ( [page] ) 
	select @page_desc
end;
GO
/****** Object:  StoredProcedure [dbo].[sp_webpage_add_permissions]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_webpage_add_permissions] (
@IDgroup int,
@IDpage int
)
AS 
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
	
	declare @AlreadyExists int = isnull((select COUNT(*) from [dbo].[users_pg_perm_groups_permissions] where IDgroup = @IDgroup and IDpage = @IDpage),0)
	if @AlreadyExists = 0 begin
		insert into [dbo].[users_pg_perm_groups_permissions]([IDgroup] , [IDpage]) 
		select @IDgroup, @IDpage 
	end
end;
GO
/****** Object:  StoredProcedure [dbo].[sp_zLN_lndb_sync]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_zLN_lndb_sync]
AS
BEGIN

/* Inserisco gli articoli non ancora presenti */
insert into dbo.item
(
 item, item_desc, UM, item_group, IDcompany, DefaultUnitValue
)
SELECT item, item_desc, UM, item_group, 0, 0 
FROM   dbo.vw_LN_anagraficaArticoli
where item COLLATE DATABASE_DEFAULT not in 
(select item COLLATE DATABASE_DEFAULT from dbo.item i )

/* Aggiorno le descrizioni che potrebbero variare nel tempo */
UPDATE dbo.item
SET item_desc = ln.item_desc
FROM
(select item, item_desc from dbo.vw_LN_anagraficaArticoli ) ln
where ln.item COLLATE DATABASE_DEFAULT = dbo.item.item

/* 2020-04-09 PULIZIA DELLE TABELLE DI CSM  */
/* Clean SPEDIZIONI: dove gli IDstock non sono più validi perchè movimentati da altri utenti */
delete from dbo.material_issue_temp where IDStock not in (select IDStock from dbo.stock)
/* Clean TRASFERIMENTI: dove gli IDstock non sono più validi perchè movimentati da altri utenti */
delete from dbo.material_transfer_temp where IDStock not in (select IDStock from dbo.stock)
 
/* Clean ORDINI DI PRODUZIONE:
1) Gli ordini di produzione che non sono stati eseguiti e che il lotto non è più a magazzino vengono eliminati  */
delete ordProd from dbo.order_production  as ordProd
where ordProd.executed = 0  /* Non eseguito */
and   ordProd.IDlot not in (select s.IDlot from dbo.stock s where s.IDcompany = ordProd.IDcompany) /* Giacenza eliminata*/
and   ordProd.IDord not in (select r.IDord from dbo.order_production_components r where r.executed = 1 ) /* Che non ci siano stati dei componenti eseguiti */
/* 2) Le righe, che a causa del punto 1 hanno perso la testata vengono eliminate */ 
--delete ordProdRow from dbo.order_production_components as ordProdRow
--where ordProdRow.executed = 0 and ordProdRow.IDord not in (select IDord from dbo.order_production)

/* Clean CUTTING ORDER: 
1) eliminiamo testate ordine dove il lotto in testata non è più presente a magazzino  */
delete ordCut from dbo.cutting_order as ordCut
where  date_executed is null
and ordCut.IDlot not in (select s.IDlot from dbo.stock s where s.IDcompany = ordCut.IDcompany) /* Giacenza non più presente a magazzino*/
/* 2) Le righe, che a causa del punto 1 hanno perso la testata vengono eliminate */ 
delete ordCutRow from dbo.cutting_order_row as ordCutRow
where ordCutRow.IDlot_new is null and ordCutRow.IDlot not in (select IDlot from dbo.cutting_order ct where ct.IDcompany = ordCutRow.IDcompany)

/* 2023-01-31, AB, sales open order from biella */
truncate table  [dbo].[zETL_LN_sales_order_open]
insert into [dbo].[zETL_LN_sales_order_open] ([t_ofbp],[t_orno],[t_pono],[t_sqnb],[t_item],[item_std],[cfg],[UM_CSM],[UM_LN]
      ,[t_qoor],[ord_bp_row],[t_prdt_c],[t_ddta],[boxed_qty_UM_LN],[shipping_qty_UM_LN],[delivered_qty_UM_LN],[leftovery_UM_LN],[LA],[LU],[PZ],[DE],[DI], record_date)
select [t_ofbp],[t_orno],[t_pono],[t_sqnb],[t_item],[t_item_std],[cfg],[UM_CSM],[UM_LN]
      ,[t_qoor],[ord_bp_row],[t_prdt_c],[t_ddta],[boxed_qty_UM_LN],[shipping_qty_UM_LN],[delivered_qty_UM_LN],[leftovery_UM_LN],[LA],[LU],[PZ],[DE],[DI], GETUTCDATE()
from [dbo].[vw_zETL_LN_sales_order_open]
update s
set s.IDcompany  = c.IDcompany
from [zETL_LN_sales_order_open] s
inner join company c on c.LN_bpid_code = s.t_ofbp

END;
GO
/****** Object:  StoredProcedure [dbo].[sp_zLN_lot_biella_info]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_zLN_lot_biella_info]
AS
BEGIN
	/* Caricamento delle dimensioni dei lotti spediti da LN e del valore
	- prefiltro sulle spedizioni con destinazione BP
	- estrazione delle dimensioni dai lotti "normali" non configurati 
	- estrazione delle dimensioni per i lotti con articoli configurati
	- estrazione delle dimensioni per i lotti con articoli configurati standard
	- estrazione del valore */
	/*
	- Per rendere l'estrazione più precisa abbiamo filtrato solo le spedizioni verso le filiali
	- Per ogni record di lotto inserimo il codice BP della filiale in modo da filtrare puntualmente
	
	2020 02 29, aggiunta la tabella lotti per fattura
	*/

	truncate table dbo.zLN_lot_dimension_from_biella
	truncate table dbo.zLN_lot_value_from_biella
	truncate table dbo.zLN_lot_by_invoice_from_biella
		
    /* Lotti per articoli normali, la inner join seleziona già solo quelli che hanno le dimensioni */
	insert into dbo.zLN_lot_dimension_from_biella
	select LN_bpid_code, sped.t_clot, sped.t_item, sped.item_std, t_ltft as IDcar ,cast(REPLACE([t_valu],',','.') as float)  as val,0, eur1
	from vw_LN_shipment_lots sped
	inner join [ERP-DB02\ERPLN].[erplndb].dbo.twhltc220815 dl 
	on dl.t_clot = sped.t_clot and sped.t_item = dl.t_item
	/* Lotti gestiti a numero, al momento AC, IG, CO 2019 01 08*/
	/* LOTTI NON GESTITI A LOTTO... */
	insert into dbo.zLN_lot_dimension_from_biella
	select LN_bpid_code, sped.t_clot, sped.t_item, sped.item_std, 'PZ' ,sum(cast(REPLACE([t_qpic],',','.') as float))  as val,0, eur1
	from [vw_LN_shipment_lots_art_num] sped
	group by LN_bpid_code, sped.t_clot, sped.t_item, sped.item_std, sped.eur1
	/* Lotti per articoli confiurati standard */
	insert into dbo.zLN_lot_dimension_from_biella
	select LN_bpid_code, sped.t_clot, sped.t_item, sped.item_std,
	case when car.t_cpft = 'LARGHEZZA' then 'LA'
		 when car.t_cpft = 'LUNGHEZZA' then 'LU'
		 when car.t_cpft = 'NUMERO' then 'PZ'
		 when car.t_cpft = 'DIAM_INTERNO' then 'DI'
		 when car.t_cpft = 'DIAM_ESTERNO' then 'DE'
	end as IDcar,	
	case when car.t_cpft = 'NUMERO' then
		--cast(REPLACE(t_copt,',','.') as float) * t_qshp  --2020-04-22, sembra che la qty in spedizione sia l'effettivo numero di pezzi 
		cast(REPLACE(t_qshp,',','.') as float)
	else
		cast(REPLACE(t_copt,',','.') as float) end as val, 		
		0
		, eur1
	from vw_LN_shipment_lots sped	
	inner join [ERP-DB02\ERPLN].[erplndb].dbo.ttipcf560815 car 
	on car.t_item = sped.t_item and car.t_cpft in ('LUNGHEZZA','LARGHEZZA','NUMERO','DIAM_INTERNO', 'DIAM_ESTERNO')

	/* Lotti per articoli configurati normali */
	insert into dbo.zLN_lot_dimension_from_biella
	select LN_bpid_code, sped.t_clot, sped.t_item, sped.item_std,  	
	case when car.t_cpft = 'LARGHEZZA' then 'LA'
		 when car.t_cpft = 'LUNGHEZZA' then 'LU'
		 when car.t_cpft = 'NUMERO' then 'PZ'
		 when car.t_cpft = 'DIAM_INTERNO' then 'DI'
		 when car.t_cpft = 'DIAM_ESTERNO' then 'DE'
	end as IDcar,
	case when car.t_cpft = 'NUMERO' then
		--cast(REPLACE(t_copt,',','.') as float) * t_qshp  --2020-04-22, sembra che la qty in spedizione sia l'effettivo numero di pezzi 
		cast(REPLACE(t_qshp,',','.') as float)
	else
		cast(REPLACE(t_copt,',','.') as float) end as val, 		
		0
		, eur1	
	from vw_LN_shipment_lots sped		
	inner join [ERP-DB02\ERPLN].[erplndb].dbo.ttipcf520815 car 
	on car.t_cpva = sped.t_cpva and car.t_cpft in ('LUNGHEZZA','LARGHEZZA','NUMERO','DIAM_INTERNO', 'DIAM_ESTERNO')
	


	/* Valori del lotti in valuta NON IN EURO */
	insert into dbo.zLN_lot_value_from_biella
	select LN_bpid_code, s.t_clot, s.t_item 	
	,case when ltrim(rtrim(i.t_dscb)) = '' then ltrim(rtrim(s.t_item)) else  ltrim(rtrim(i.t_dscb)) end as item_std
	
	/*,r.t_tran, r.t_idoc*/,sum(r.t_amti) / count(s.t_item) ,0
	from [ERP-DB02\ERPLN].[erplndb].dbo.twhinh431815 s 
	/* Non usiamo la vista delle altre import perchè con la distinct non abbiamo la sped che ci serve per la join*/
	inner join [ERP-DB02\ERPLN].[erplndb].dbo.tcisli310815 r on r.t_shpm = s.t_shpm and s.t_pono = r.t_shln
	/* Solo gli articoli non frazionabili, gli altri non abbiamo la certezza delle dimensioni o del valore */
	inner join [ERP-DB02\ERPLN].[erplndb].dbo.ttcibd001815 i on i.t_item = s.t_item
	/* Scartiamo i lotti sui cui è stato messo il flag consenti eccezionalmente ... */
	inner join [ERP-DB02\ERPLN].[erplndb].dbo.twhltc100815 l on l.t_clot = s.t_clot 
	/* Solo spedizioni verso filiali, il codice bp di ln è dentro la tabella company */
	inner join dbo.company c on [LN_bpid_code] COLLATE DATABASE_DEFAULT = r.t_ofbp
	where t_worg = 1  and (IsNull(s.t_clot, '') <> '')  
	--and l.t_cflt_c = 2  /*2020 01 08, fix, carico i costi dei lotti anche frazionabili */
	--and i.t_slot_c = 2  /*2020 01 08, fix, carico i costi dei lotti anche frazionabili */
	--and i.t_ctyp not in ('CA', 'IG', 'UC', 'UV', 'CO','AC')
	and i.t_ctyp not in ('CA', 'UC', 'UV')  /* 2019 01 08 richiesta delboca */
	  
	/* Alcuni configurati vengono divisi su più spedizioni, raggruppiamo per avere il valore singolo */
	/* In alcuni casi lo stesso lotto, per lo stesso odv, e in più fatture, togliamo quindi il riferimento
	alla fattuara, raggruppiamo solo per articolo-lotto, sommiamo il valore e dividiamo per il numero di record */
	/* Escludiamo alcune famiglie articolo dove non seguno un flusso standard CA, IG, UC, UV, CO */
	group by LN_bpid_code, s.t_clot, s.t_item, case when ltrim(rtrim(i.t_dscb)) = '' then ltrim(rtrim(s.t_item)) else  ltrim(rtrim(i.t_dscb)) end /* ,r.t_tran, r.t_idoc */


	/* ULTIMO PASSO: popoliamo il campo IDitem con il l'identificativo del sistema csm */
	/* LA tabella degli articoli è CONDIVISA, non c'è la company, la lista è singola */
	UPDATE dim_lot_f_bi
	SET dim_lot_f_bi.IDitem = (select IDitem from dbo.item i 
							  where i.item = dim_lot_f_bi.item_std)
							  --and i.IDcompany = (select c.IDcompany from [dbo].[company] c where c.[LN_bpid_code] = dim_lot_f_bi.LN_bpid_code)
							  --/*Recuper il numero della company in base al codice BP */)
	FROM dbo.zLN_lot_dimension_from_biella dim_lot_f_bi
	
	UPDATE val_lot_f_bi
	SET val_lot_f_bi.IDitem = (select IDitem from dbo.item i 
							  where i.item = val_lot_f_bi.item_std)
							  --and i.IDcompany = (select c.IDcompany from [dbo].[company] c where c.[LN_bpid_code] = val_lot_f_bi.LN_bpid_code)
							  --/*Recuper il numero della company in base al codice BP */)
	FROM dbo.zLN_lot_value_from_biella val_lot_f_bi
	

	/* 2020 02 29, lotti per fattura */
	insert into  zLN_lot_by_invoice_from_biella
	SELECT *	
	FROM [dbo].[vw_LN_InvoiceLots]
	end;
GO
/****** Object:  StoredProcedure [dbo].[spc_zETL_lot_biella_info]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[spc_zETL_lot_biella_info]
AS
BEGIN
/* 2021-03-27
1) Popoliamo la zETL_LN_lots_delivery_notes_from_biella che contiene
i lotti, con la quantità e valore in spedizione e con il riferimento al DDT
2) Partendo dai lotti presenti dalla tabella caricata al punto 1 andiamo 
a prendere le dimensioni

Note:
I campi t_shpm, t_pono vengono usati solo per ordinare l'estrazione nello 
stesso modo in cui le filiali ricevono il DDT
*/
truncate table dbo.zETL_LN_lots_delivery_notes_from_biella
truncate table dbo.zETL_LN_lot_dimension_from_biella
insert into  dbo.zETL_LN_lots_delivery_notes_from_biella
select IDcompany, t_deln, t_shpm, t_pono, t_crdt, t_item, t_dscb, t_ctyp, t_cpva, t_clot,
	   case when ltrim(rtrim(t_dscb)) = '' then ltrim(rtrim(t_item)) else  ltrim(rtrim(t_dscb)) end as item_std, 0,	   
	   case when t_eur1_c = 1 then 1
			when t_eur1_c = 2 then 0
	   end as eur1,	    	   
	   t_corn, t_qshp, isnull(t_amti,0) as t_amti, 
	   
	   case when ltrim(rtrim(t_dscb)) = '' then 0 else 1 end as conf_item  --2023-01-02, AB, gestione articoli conf.
from 
		(select c.IDcompany, dd.t_deln, sr.t_shpm, sr.t_pono, dd.t_crdt, sr.t_item, it.t_dscb, it.t_ctyp, it.t_cpva, sr.t_clot, lo.t_eur1_c , sr.t_corn, 
		sum(t_qshp) as t_qshp, sum(iv.t_amti) as t_amti /* VALORE IN VALUTA non in EUR */	
		from [ERP-DB02\ERPLN].[erplndb].dbo.twhinh430815 sh
		inner join [ERP-DB02\ERPLN].[erplndb].dbo.twhinh435815 dd on dd.t_prdn = sh.t_prdn	
		inner join [ERP-DB02\ERPLN].[erplndb].dbo.twhinh431815 sr on sr.t_shpm = sh.t_shpm		
		inner join [ERP-DB02\ERPLN].[erplndb].dbo.ttcibd001815 it on it.t_item = sr.t_item
		inner join [ERP-DB02\ERPLN].[erplndb].dbo.twhltc100815 lo on lo.t_clot = sr.t_clot 
		/* inner join 2021-07-13,AB, fix per Kruse, ricevono la merce prima che venga fatturata */
		left outer join [ERP-DB02\ERPLN].[erplndb].dbo.tcisli310815 iv on dd.t_deln = iv.t_deln and iv.t_shpm = sr.t_shpm and sr.t_pono = iv.t_shln
		/* Solo spedizioni verso filiali, il codice bp di ln è dentro la tabella company */
		inner join dbo.company c on [LN_bpid_code] COLLATE DATABASE_DEFAULT = sh.t_ofbp
		where dd.t_crdt > DateAdd(MM, -3, getutcdate()) /* Leggiamo i ddt fino a 3 mesi  */
		and it.t_ctyp not in ('CA', 'UC', 'UV')			/* Escludiamo famiglie di costo o comunque non utilizzabili su CSM */
		and ltrim(rtrim(t_ctyp))						/* Famigli escluse anche su "vw_LN_anagraficaArticoli", mantenere allinetate (fare view statica ?)
														ATTENZIONE, i configurati hanno la famiglia vuota, qui sono da NON escludere */
		not in ('SB','SC','ST','TT','FT','MD','MG','PC','MS','PU','ED','TS','CL','UV', 'XP','XE','XF','SL','ZZ','XV')	 
		--and dd.t_deln = '7300000000000001516'	
		group by c.IDcompany, dd.t_deln, sr.t_shpm, sr.t_pono, dd.t_crdt, sr.t_item, it.t_dscb, it.t_ctyp, it.t_cpva, sr.t_clot, lo.t_eur1_c, sr.t_corn) base

	/* Carico l'ID articolo presente su CSM */
	update zETL_LN_lots_delivery_notes_from_biella
	set IDitem = (select IDitem from dbo.item i where i.item = zETL_LN_lots_delivery_notes_from_biella.item_std)
	/* Inserimento dimensioni 
	1) Lotti non dimensionati, cioè gestiti solo a numero	
	2) Lotti per articoli dimensionati "normali", dimensioni presenti nella whltc220815
	3) Lotti articolo configurati 
	4) Lotti articolo configurati standard
	*/
	
	--1)
	insert into [dbo].[zETL_LN_lot_dimension_from_biella]
	select etl.IDcompany, etl.t_deln, etl.t_shpm, etl.t_pono, etl.item_std, etl.t_clot, t_ltft as IDcar ,cast(REPLACE([t_valu],',','.') as float)  as val 
	from zETL_LN_lots_delivery_notes_from_biella etl
	inner join [ERP-DB02\ERPLN].[erplndb].dbo.twhltc220815 dl on dl.t_clot COLLATE DATABASE_DEFAULT = etl.t_clot and dl.t_item COLLATE DATABASE_DEFAULT = etl.t_item
	--2)  --VERIFICARE GLI NP ...
	insert into [dbo].[zETL_LN_lot_dimension_from_biella]
	select etl.IDcompany, etl.t_deln, etl.t_shpm, etl.t_pono, etl.item_std, etl.t_clot, 'PZ' ,sum(cast(REPLACE([t_qshp],',','.') as float))  as val
	from zETL_LN_lots_delivery_notes_from_biella etl
	inner join item i on etl.IDitem = i.IDitem
	where um = 'N'
	and t_dscb = '' --2021-12-04, AB, Fix MB5 configurato che anche come item STD rimane gestito a N 
	group by etl.IDcompany, etl.t_deln, etl.t_shpm, etl.t_pono, etl.item_std, etl.t_clot	
	
	--3)
	/* Lotti per articoli confiurati standard */
	insert into dbo.[zETL_LN_lot_dimension_from_biella]
	select etl.IDcompany, etl.t_deln, etl.t_shpm, etl.t_pono, etl.item_std, etl.t_clot,
	case when car.t_cpft = 'LARGHEZZA' then 'LA'
		 when car.t_cpft = 'LUNGHEZZA' then 'LU'
		 when car.t_cpft = 'NUMERO' then 'PZ'
		 when car.t_cpft = 'DIAM_INTERNO' then 'DI'
		 when car.t_cpft = 'DIAM_ESTERNO' then 'DE'
	end as IDcar,	
	case when car.t_cpft = 'NUMERO' then
		--cast(REPLACE(t_copt,',','.') as float) * t_qshp  --2020-04-22, sembra che la qty in spedizione sia l'effettivo numero di pezzi 
		cast(REPLACE(t_qshp,',','.') as float)
	else
		cast(REPLACE(t_copt,',','.') as float) end as val 		
	from zETL_LN_lots_delivery_notes_from_biella etl	
	inner join [ERP-DB02\ERPLN].[erplndb].dbo.ttipcf560815 car 
	on car.t_item COLLATE DATABASE_DEFAULT = etl.t_item and car.t_cpft in ('LUNGHEZZA','LARGHEZZA','NUMERO','DIAM_INTERNO', 'DIAM_ESTERNO')

	--4)
	insert into dbo.[zETL_LN_lot_dimension_from_biella]
	select etl.IDcompany, etl.t_deln, etl.t_shpm, etl.t_pono, etl.item_std, etl.t_clot,
	case when car.t_cpft = 'LARGHEZZA' then 'LA'
		 when car.t_cpft = 'LUNGHEZZA' then 'LU'
		 when car.t_cpft = 'NUMERO' then 'PZ'
		 when car.t_cpft = 'DIAM_INTERNO' then 'DI'
		 when car.t_cpft = 'DIAM_ESTERNO' then 'DE'
	end as IDcar,
	case when car.t_cpft = 'NUMERO' then
		--cast(REPLACE(t_copt,',','.') as float) * t_qshp  --2020-04-22, sembra che la qty in spedizione sia l'effettivo numero di pezzi 
		cast(REPLACE(t_qshp,',','.') as float)
	else
		cast(REPLACE(t_copt,',','.') as float) end as val		
	from zETL_LN_lots_delivery_notes_from_biella etl
	inner join [ERP-DB02\ERPLN].[erplndb].dbo.ttipcf520815 car 
	on car.t_cpva = etl.t_cpva and car.t_cpft in ('LUNGHEZZA','LARGHEZZA','NUMERO','DIAM_INTERNO', 'DIAM_ESTERNO')

end;
GO
/****** Object:  StoredProcedure [dbo].[sync_db_from_production]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

              
        CREATE   PROCEDURE [dbo].[sync_db_from_production] (@idCompany int)
        AS 

        BEGIN
            BEGIN TRY
                BEGIN TRANSACTION; 
                

                delete from test_import.dbo.table_sequences where company_id = @idCompany;  

                 

                EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT all';

                    IF(@idCompany = 0)
                    BEGIN
                        DELETE FROM test_import.dbo.temp_item_id;
                    END
            
                      

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'company_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.company DISABLE TRIGGER company_custom_id;
           end   

 DELETE FROM test_import.dbo.company where IDcompany = @idCompany;

INSERT INTO test_import.dbo.company (IDcompany,[desc],curr,lot_code,LN_bpid_code,CSM_bpid_code,logo_on_prints,read_alternative_item_code)
                SELECT IDcompany,[desc],curr,lot_code,LN_bpid_code,CSM_bpid_code,logo_on_prints,read_alternative_item_code
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.company where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'warehouse_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.warehouse DISABLE TRIGGER warehouse_custom_id;
           end   

 DELETE FROM test_import.dbo.warehouse where IDcompany = @idCompany;

INSERT INTO test_import.dbo.warehouse (IDcompany,IDwarehouse,IDcountry,[desc])
                SELECT IDcompany,IDwarehouse,IDcountry,[desc]
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.warehouse where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'warehouse_location_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.warehouse_location DISABLE TRIGGER warehouse_location_custom_id;
           end   

 DELETE FROM test_import.dbo.warehouse_location where IDcompany = @idCompany;

INSERT INTO test_import.dbo.warehouse_location (IDcompany,IDwarehouse,IDlocation,[desc],note,DefaultLoadLocPerWh,IDwh_loc_Type)
                SELECT IDcompany,IDwarehouse,IDlocation,[desc],note,DefaultLoadLocPerWh,IDwh_loc_Type
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.warehouse_location where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'warehouse_location_type_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.warehouse_location_type DISABLE TRIGGER warehouse_location_type_custom_id;
           end   

 DELETE FROM test_import.dbo.warehouse_location_type;

SET IDENTITY_INSERT warehouse_location_type ON;

INSERT INTO test_import.dbo.warehouse_location_type (IDwh_loc_Type,tname,tdesc,evaluated)
                SELECT IDwh_loc_Type,tname,tdesc,evaluated
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.warehouse_location_type;

SET IDENTITY_INSERT warehouse_location_type OFF;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'WAC_year_layers_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.WAC_year_layers DISABLE TRIGGER WAC_year_layers_custom_id;
           end   

 DELETE FROM test_import.dbo.WAC_year_layers where IDcompany = @idCompany;

INSERT INTO test_import.dbo.WAC_year_layers (IDlayer,IDcompany,username,date_calc,year_layer,definitive,date_definitive)
                SELECT IDlayer,IDcompany,username,date_calc,year_layer,definitive,date_definitive
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.WAC_year_layers where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'WAC_year_layers_item_detail_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.WAC_year_layers_item_detail DISABLE TRIGGER WAC_year_layers_item_detail_custom_id;
           end   

 DELETE FROM test_import.dbo.WAC_year_layers_item_detail where IDcompany = @idCompany;

INSERT INTO test_import.dbo.WAC_year_layers_item_detail (IDlayer_detail,IDcompany,year_layer,IDitem,item,stock_qty_start_year,stock_value_start_year,purchasedQty_on_the_year,purchasedItemValue_on_the_year,stock_qty_end_year,stock_value_end_year,wac_avg_cost,conf_item)
                SELECT IDlayer_detail,IDcompany,year_layer,IDitem,item,stock_qty_start_year,stock_value_start_year,purchasedQty_on_the_year,purchasedItemValue_on_the_year,stock_qty_end_year,stock_value_end_year,wac_avg_cost,conf_item
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.WAC_year_layers_item_detail where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'adjustments_history_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.adjustments_history DISABLE TRIGGER adjustments_history_custom_id;
           end   

 DELETE FROM test_import.dbo.adjustments_history where IDcompany = @idCompany;

INSERT INTO test_import.dbo.adjustments_history (IDadjustments,IDcompany,date_adj,IDlot,IDwarehouse,IDlocation,segno,qty,IDadjtype,IDinventory,username)
                SELECT IDadjustments,IDcompany,date_adj,IDlot,IDwarehouse,IDlocation,segno,qty,IDadjtype, NULLIF(IDinventory, 0) as IDinventory,username
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.adjustments_history where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'adjustments_type_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.adjustments_type DISABLE TRIGGER adjustments_type_custom_id;
           end   

 DELETE FROM test_import.dbo.adjustments_type;

INSERT INTO test_import.dbo.adjustments_type (IDadjtype,[desc],invetory,ordinamento)
                SELECT IDadjtype,[desc],invetory,ordinamento
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.adjustments_type;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'bp_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.bp DISABLE TRIGGER bp_custom_id;
           end   

 DELETE FROM test_import.dbo.bp where IDcompany = @idCompany;

INSERT INTO test_import.dbo.bp (IDcompany,IDbp,[desc],supplier,customer)
                SELECT IDcompany,IDbp,[desc],supplier,customer
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.bp where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'bp_destinations_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.bp_destinations DISABLE TRIGGER bp_destinations_custom_id;
           end   

 DELETE FROM test_import.dbo.bp_destinations where IDcompany = @idCompany;

INSERT INTO test_import.dbo.bp_destinations (IDdestination,IDcompany,IDbp,[desc])
                SELECT IDdestination,IDcompany,IDbp,[desc]
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.bp_destinations where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'country_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.country DISABLE TRIGGER country_custom_id;
           end   

 DELETE FROM test_import.dbo.country where IDcompany = @idCompany;

INSERT INTO test_import.dbo.country (IDcompany,IDcountry,[desc])
                SELECT IDcompany,IDcountry,[desc]
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.country where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'cutting_order_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.cutting_order DISABLE TRIGGER cutting_order_custom_id;
           end   

 DELETE FROM test_import.dbo.cutting_order where IDcompany = @idCompany;

INSERT INTO test_import.dbo.cutting_order (IDcompany,IDlot,executed,date_executed,username,date_creation,date_planned,id)
                SELECT IDcompany,IDlot,executed,date_executed,username,date_creation,date_planned,ROW_NUMBER() OVER(ORDER BY IDcompany ASC) 
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.cutting_order where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'cutting_order_row_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.cutting_order_row DISABLE TRIGGER cutting_order_row_custom_id;
           end   

 DELETE FROM test_import.dbo.cutting_order_row where IDcompany = @idCompany;

INSERT INTO test_import.dbo.cutting_order_row (IDcompany,IDlot,IDcut,PZ,LA,LU,IDlot_new,ord_rif,step_roll_order,step_roll,IDlocation)
                SELECT IDcompany,IDlot,IDcut,PZ,LA,LU,IDlot_new,ord_rif,step_roll_order,step_roll,IDlocation
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.cutting_order_row where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'devaluation_history_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.devaluation_history DISABLE TRIGGER devaluation_history_custom_id;
           end   

 DELETE FROM test_import.dbo.devaluation_history where IDcompany = @idCompany;

INSERT INTO test_import.dbo.devaluation_history (IDdevaluation,IDcompany,date_dev,username)
                SELECT IDdevaluation,IDcompany,date_dev,username
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.devaluation_history where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'inventory_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.inventory DISABLE TRIGGER inventory_custom_id;
           end   

 DELETE FROM test_import.dbo.inventory where IDcompany = @idCompany;

INSERT INTO test_import.dbo.inventory (IDcompany,IDinventory,[desc],completed,start_date,end_date,username)
                SELECT IDcompany,IDinventory,[desc],completed,start_date,end_date,username
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.inventory where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'inventory_lots_history_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.inventory_lots_history DISABLE TRIGGER inventory_lots_history_custom_id;
           end   

 DELETE FROM test_import.dbo.inventory_lots_history where IDcompany = @idCompany;

INSERT INTO test_import.dbo.inventory_lots_history (IDcompany,IDinventory,IDlot,qty,invUsername,invDate_ins,IDwarehouse,IDlocation,id)
                SELECT IDcompany,IDinventory,IDlot,qty,invUsername,invDate_ins,IDwarehouse,IDlocation,ROW_NUMBER() OVER(ORDER BY IDcompany ASC) 
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.inventory_lots_history where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'item_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.item DISABLE TRIGGER item_custom_id;
           end   

 DELETE FROM test_import.dbo.item where IDcompany = @idCompany;

INSERT INTO test_import.dbo.item (IDitem,item,item_desc,um,item_group,IDcompany,DefaultUnitValue)
                SELECT IDitem,item,item_desc,um,item_group,IDcompany,DefaultUnitValue
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.item where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'item_enabled_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.item_enabled DISABLE TRIGGER item_enabled_custom_id;
           end   

 DELETE FROM test_import.dbo.item_enabled where IDcompany = @idCompany;

INSERT INTO test_import.dbo.item_enabled (IDcompany,IDitem,altv_code,altv_desc,id)
                SELECT IDcompany,IDitem,altv_code,altv_desc,ROW_NUMBER() OVER(ORDER BY IDcompany ASC) 
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.item_enabled where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'item_group_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.item_group DISABLE TRIGGER item_group_custom_id;
           end   

 DELETE FROM test_import.dbo.item_group where IDcompany = @idCompany;

INSERT INTO test_import.dbo.item_group (item_group,group_desc,IDcompany,id)
                SELECT item_group,group_desc,IDcompany,ROW_NUMBER() OVER(ORDER BY item_group ASC) 
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.item_group where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'item_stock_limits_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.item_stock_limits DISABLE TRIGGER item_stock_limits_custom_id;
           end   

 DELETE FROM test_import.dbo.item_stock_limits where IDcompany = @idCompany;

INSERT INTO test_import.dbo.item_stock_limits (IDitemStockLimits,IDcompany,IDitem,IDwarehouse,qty_min,qty_max,username,date_ins,enabled)
                SELECT IDitemStockLimits,IDcompany,IDitem,IDwarehouse,qty_min,qty_max,username,date_ins,enabled
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.item_stock_limits where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'logs_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.logs DISABLE TRIGGER logs_custom_id;
           end   

 DELETE FROM test_import.dbo.logs where IDcompany = @idCompany;

INSERT INTO test_import.dbo.logs (IDerr,IDcompany,username,date,vars,errors)
                SELECT IDerr,IDcompany,username,date,vars,errors
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.logs where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'lot_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.lot DISABLE TRIGGER lot_custom_id;
           end   

 DELETE FROM test_import.dbo.lot where IDcompany = @idCompany;

INSERT INTO test_import.dbo.lot (IDcompany,IDlot,IDitem,date_ins,date_lot,IDlot_padre,IDlot_origine,IDlot_fornitore,note,IDbp,stepRoll,step_roll_order,checked_value,devaluation,ord_rif,checked_value_date,eur1,conf_item,merged_lot)
                SELECT IDcompany,IDlot,IDitem,date_ins,date_lot,IDlot_padre,IDlot_origine,IDlot_fornitore,note, NULLIF(IDbp, 0) as IDbp,stepRoll,step_roll_order,checked_value,devaluation,ord_rif,checked_value_date,eur1,conf_item,merged_lot
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.lot where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'lot_dimension_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.lot_dimension DISABLE TRIGGER lot_dimension_custom_id;
           end   

 DELETE FROM test_import.dbo.lot_dimension where IDcompany = @idCompany;

INSERT INTO test_import.dbo.lot_dimension (IDcompany,IDlot,IDcar,val,id)
                SELECT IDcompany,IDlot,IDcar,val,ROW_NUMBER() OVER(ORDER BY IDcompany ASC) 
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.lot_dimension where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'lot_numeri_primi_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.lot_numeri_primi DISABLE TRIGGER lot_numeri_primi_custom_id;
           end   

 DELETE FROM test_import.dbo.lot_numeri_primi where IDcompany = @idCompany;

INSERT INTO test_import.dbo.lot_numeri_primi (IDcompany,comp_code,country_code,type,year_n,incrementale,id)
                SELECT IDcompany,comp_code,country_code,type,year_n,incrementale,ROW_NUMBER() OVER(ORDER BY IDcompany ASC) 
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.lot_numeri_primi where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'lot_type_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.lot_type DISABLE TRIGGER lot_type_custom_id;
           end   

 DELETE FROM test_import.dbo.lot_type where IDcompany = @idCompany;

INSERT INTO test_import.dbo.lot_type (IDcompany,IDlotType,[desc],id)
                SELECT IDcompany,IDlotType,[desc],ROW_NUMBER() OVER(ORDER BY IDcompany ASC) 
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.lot_type where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'lot_value_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.lot_value DISABLE TRIGGER lot_value_custom_id;
           end   

 DELETE FROM test_import.dbo.lot_value where IDcompany = @idCompany;

INSERT INTO test_import.dbo.lot_value (IDcompany,IDlot,date_ins,UnitValue,username,IDdevaluation,note,id)
                SELECT IDcompany,IDlot,date_ins,UnitValue,username, NULLIF(IDdevaluation, 0) as IDdevaluation,note,ROW_NUMBER() OVER(ORDER BY IDcompany ASC) 
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.lot_value where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'material_issue_temp_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.material_issue_temp DISABLE TRIGGER material_issue_temp_custom_id;
           end   

 DELETE FROM test_import.dbo.material_issue_temp where IDcompany = @idCompany;

INSERT INTO test_import.dbo.material_issue_temp (IDcompany,IDissue,username,qty,IDStock,date_ins)
                SELECT IDcompany,IDissue,username,qty,IDStock,date_ins
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.material_issue_temp where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'material_transfer_temp_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.material_transfer_temp DISABLE TRIGGER material_transfer_temp_custom_id;
           end   

 DELETE FROM test_import.dbo.material_transfer_temp where IDcompany = @idCompany;

INSERT INTO test_import.dbo.material_transfer_temp (IDcompany,IDtrans,username,qty,IDStock,date_ins)
                SELECT IDcompany,IDtrans,username,qty,IDStock,date_ins
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.material_transfer_temp where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'stock_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.stock DISABLE TRIGGER stock_custom_id;
           end   

 DELETE FROM test_import.dbo.stock where IDcompany = @idCompany;

INSERT INTO test_import.dbo.stock (IDstock,IDcompany,IDlot,IDwarehouse,IDlocation,qty_stock,IDinventory,invUsername,invDate_ins)
                SELECT IDstock,IDcompany,IDlot,IDwarehouse,IDlocation,qty_stock,IDinventory,invUsername,invDate_ins
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.stock where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'transactions_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.transactions DISABLE TRIGGER transactions_custom_id;
           end   

 DELETE FROM test_import.dbo.transactions where IDcompany = @idCompany;

INSERT INTO test_import.dbo.transactions (IDtransaction,IDcompany,date_tran,IDlot,IDwarehouse,IDlocation,segno,qty,IDtrantype,ord_rif,username,IDbp,IDprodOrd)
                SELECT IDtransaction,IDcompany,date_tran,IDlot,IDwarehouse,IDlocation,segno,qty, NULLIF(IDtrantype, 0) as IDtrantype,ord_rif,username, NULLIF(IDbp, 0) as IDbp, NULLIF(IDprodOrd, 0) as IDprodOrd
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.transactions where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'transactions_type_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.transactions_type DISABLE TRIGGER transactions_type_custom_id;
           end   

 DELETE FROM test_import.dbo.transactions_type;

INSERT INTO test_import.dbo.transactions_type (IDtrantype,[desc])
                SELECT IDtrantype,[desc]
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.transactions_type;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'order_production_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.order_production DISABLE TRIGGER order_production_custom_id;
           end   

 DELETE FROM test_import.dbo.order_production where IDcompany = @idCompany;

INSERT INTO test_import.dbo.order_production (IDord,IDcompany,IDlot,IDwarehouse,IDlocation,qty,username,date_creation,date_executed,executed)
                SELECT IDord,IDcompany,IDlot,IDwarehouse,IDlocation,qty,username,date_creation,date_executed,executed
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.order_production where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'order_production_components_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.order_production_components DISABLE TRIGGER order_production_components_custom_id;
           end   

 DELETE FROM test_import.dbo.order_production_components where IDcompany = @idCompany;

INSERT INTO test_import.dbo.order_production_components (IDcomp,IDord,IDcompany,IDitem,qty_expected,auto_lot,IDStock,qty,executed,username,IDlot)
                SELECT IDcomp,IDord,IDcompany,IDitem,qty_expected,auto_lot, NULLIF(IDStock, 0) as IDStock,qty,executed,username,IDlot
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.order_production_components where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'order_split_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.order_split DISABLE TRIGGER order_split_custom_id;
           end   

 DELETE FROM test_import.dbo.order_split where IDcompany = @idCompany;

INSERT INTO test_import.dbo.order_split (IDcompany,IDord,IDlot,IDstock,IDwarehouse,IDlocation,qty_ori,username,date_creation,date_executed,executed)
                SELECT IDcompany,IDord,IDlot,IDstock,IDwarehouse,IDlocation,qty_ori,username,date_creation,date_executed,executed
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.order_split where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'order_split_row_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.order_split_row DISABLE TRIGGER order_split_row_custom_id;
           end   

 DELETE FROM test_import.dbo.order_split_row where IDcompany = @idCompany;

INSERT INTO test_import.dbo.order_split_row (IDRowSplit,IDcompany,IDord,qty_split,ord_ref,IDlocation,IDlot_new)
                SELECT IDRowSplit,IDcompany,IDord,qty_split,ord_ref,IDlocation,IDlot_new
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.order_split_row where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'receptions_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.receptions DISABLE TRIGGER receptions_custom_id;
           end   

 DELETE FROM test_import.dbo.receptions where IDcompany = @idCompany;

INSERT INTO test_import.dbo.receptions (IDreception,IDcompany,IDlot,IDlot_fornitore,date_rec,qty,username,IDbp,ord_rif,delivery_note)
                SELECT IDreception,IDcompany,IDlot,IDlot_fornitore,date_rec,qty,username, NULLIF(IDbp, 0) as IDbp,ord_rif,delivery_note
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.receptions where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'shipments_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.shipments DISABLE TRIGGER shipments_custom_id;
           end   

 DELETE FROM test_import.dbo.shipments where IDcompany = @idCompany;

INSERT INTO test_import.dbo.shipments (IDshipments,IDcompany,date_ship,IDlot,qty,IDbp,IDdestination,delivery_note)
                SELECT IDshipments,IDcompany,date_ship,IDlot,qty,IDbp, NULLIF(IDdestination, 0) as IDdestination,delivery_note
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.shipments where IDcompany = @idCompany;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'um_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.um DISABLE TRIGGER um_custom_id;
           end   

 DELETE FROM test_import.dbo.um;

INSERT INTO test_import.dbo.um (IDdim,[desc],frazionabile,decimal_on_stock_qty)
                SELECT IDdim,[desc],frazionabile,decimal_on_stock_qty
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.um;

  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'um_dimension_custom_id' AND [type] = 'TR')
           begin
           alter table test_import.dbo.um_dimension DISABLE TRIGGER um_dimension_custom_id;
           end   

 DELETE FROM test_import.dbo.um_dimension;

SET IDENTITY_INSERT um_dimension ON;

INSERT INTO test_import.dbo.um_dimension (IDdim,IDcar,Ordinamento,umdesc,um,umdescs,id)
                SELECT IDdim,IDcar,Ordinamento,umdesc,um,umdescs,ROW_NUMBER() OVER(ORDER BY IDdim ASC) 
                FROM [CHIORINO\PRODUZIONE].CSM.dbo.um_dimension;

SET IDENTITY_INSERT um_dimension OFF;


            EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT all';



            DECLARE @n_rows int;
            DECLARE @next_id varchar(max);
            DECLARE @inc int;
            DECLARE @id VARCHAR(MAX);


           
            IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'company_custom_id' AND [type] = 'TR')
        begin
        alter table company ENABLE TRIGGER company_custom_id;
        end  
                        CREATE TABLE #tmp_ins_warehouse
                        ( id INT identity(1,1) not null,
                        old_id VARCHAR(250) NOT NULL,
                        new_id VARCHAR(250) not null
                        );                    
                    ALTER TABLE warehouse_location  NOCHECK CONSTRAINT all;
 
                            exec next_table_id @idCompany, N'warehouse', @next_id OUTPUT, @inc OUTPUT;
    
                            set @n_rows = (select count(*) from test_import.dbo.warehouse WHERE IDcompany = @idCompany) - 1
    
                            insert into #tmp_ins_warehouse (old_id, new_id) select IDwarehouse, CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + ROW_NUMBER() OVER(ORDER BY IDwarehouse ASC))) from test_import.dbo.warehouse WHERE IDwarehouse not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany; 
        
                            
                            update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'warehouse';
                            
                            update x set IDwarehouse = id from (SELECT tmp.new_id as id, y.IDwarehouse from test_import.dbo.warehouse y, #tmp_ins_warehouse tmp where tmp.old_id = y.IDwarehouse and y.IDcompany = @idCompany) x;
    
                            update x set IDwarehouse = id from (SELECT tmp.new_id as id, y.IDwarehouse from test_import.dbo.warehouse_location y, #tmp_ins_warehouse tmp where tmp.old_id = y.IDwarehouse and y.IDcompany = @idCompany) x;
                            
                            ALTER TABLE warehouse_location  CHECK CONSTRAINT all;
drop table #tmp_ins_warehouse;IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'warehouse_custom_id' AND [type] = 'TR')
        begin
        alter table warehouse ENABLE TRIGGER warehouse_custom_id;
        end  
                        CREATE TABLE #tmp_ins_warehouse_location
                        ( id INT identity(1,1) not null,
                        old_id VARCHAR(250) NOT NULL,
                        new_id VARCHAR(250) not null
                        );                    
                    ALTER TABLE order_split_row  NOCHECK CONSTRAINT all;
ALTER TABLE order_production  NOCHECK CONSTRAINT all;
 
                            exec next_table_id @idCompany, N'warehouse_location', @next_id OUTPUT, @inc OUTPUT;
    
                            set @n_rows = (select count(*) from test_import.dbo.warehouse_location WHERE IDcompany = @idCompany) - 1
    
                            insert into #tmp_ins_warehouse_location (old_id, new_id) select IDlocation, CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + ROW_NUMBER() OVER(ORDER BY IDlocation ASC))) from test_import.dbo.warehouse_location WHERE IDlocation not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany; 
        
                            
                            update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'warehouse_location';
                            
                            update x set IDlocation = id from (SELECT tmp.new_id as id, y.IDlocation from test_import.dbo.warehouse_location y, #tmp_ins_warehouse_location tmp where tmp.old_id = y.IDlocation and y.IDcompany = @idCompany) x;
    
                            update x set IDlocation = id from (SELECT tmp.new_id as id, y.IDlocation from test_import.dbo.order_split_row y, #tmp_ins_warehouse_location tmp where tmp.old_id = y.IDlocation and y.IDcompany = @idCompany) x;
                            
                            
    
                            update x set IDlocation = id from (SELECT tmp.new_id as id, y.IDlocation from test_import.dbo.order_production y, #tmp_ins_warehouse_location tmp where tmp.old_id = y.IDlocation and y.IDcompany = @idCompany) x;
                            
                            ALTER TABLE order_split_row  CHECK CONSTRAINT all;
ALTER TABLE order_production  CHECK CONSTRAINT all;
drop table #tmp_ins_warehouse_location;IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'warehouse_location_custom_id' AND [type] = 'TR')
        begin
        alter table warehouse_location ENABLE TRIGGER warehouse_location_custom_id;
        end  IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'warehouse_location_type_custom_id' AND [type] = 'TR')
        begin
        alter table warehouse_location_type ENABLE TRIGGER warehouse_location_type_custom_id;
        end  
                    
                    exec next_table_id @idCompany, N'WAC_year_layers', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.WAC_year_layers WHERE IDcompany = @idCompany) - 1;
                    
                    update x set IDlayer= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY IDlayer ASC) AS row_number, IDlayer
                    from test_import.dbo.WAC_year_layers WHERE IDlayer not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'WAC_year_layers';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'WAC_year_layers_custom_id' AND [type] = 'TR')
        begin
        alter table WAC_year_layers ENABLE TRIGGER WAC_year_layers_custom_id;
        end  
                
        
                
                    update x set IDitem = id from (SELECT t.new_item_id as id, l.IDitem FROM test_import.dbo.temp_item_id t, test_import.dbo.WAC_year_layers_item_detail l WHERE t.item_id = l.IDitem) x; 
                        CREATE TABLE #tmp_ins_WAC_year_layers_item_detail
                        ( id INT identity(1,1) not null,
                        old_id VARCHAR(250) NOT NULL,
                        new_id VARCHAR(250) not null
                        );                    
                     
                            exec next_table_id @idCompany, N'WAC_year_layers_item_detail', @next_id OUTPUT, @inc OUTPUT;
    
                            set @n_rows = (select count(*) from test_import.dbo.WAC_year_layers_item_detail WHERE IDcompany = @idCompany) - 1
    
                            insert into #tmp_ins_WAC_year_layers_item_detail (old_id, new_id) select IDlayer_detail, CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + ROW_NUMBER() OVER(ORDER BY IDlayer_detail ASC))) from test_import.dbo.WAC_year_layers_item_detail WHERE IDlayer_detail not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany; 
        
                            
                            update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'WAC_year_layers_item_detail';
                            
                            update x set IDlayer_detail = id from (SELECT tmp.new_id as id, y.IDlayer_detail from test_import.dbo.WAC_year_layers_item_detail y, #tmp_ins_WAC_year_layers_item_detail tmp where tmp.old_id = y.IDlayer_detail and y.IDcompany = @idCompany) x;drop table #tmp_ins_WAC_year_layers_item_detail;IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'WAC_year_layers_item_detail_custom_id' AND [type] = 'TR')
        begin
        alter table WAC_year_layers_item_detail ENABLE TRIGGER WAC_year_layers_item_detail_custom_id;
        end  
                    
                    exec next_table_id @idCompany, N'adjustments_history', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.adjustments_history WHERE IDcompany = @idCompany) - 1;
                    
                    update x set IDadjustments= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY IDadjustments ASC) AS row_number, IDadjustments
                    from test_import.dbo.adjustments_history WHERE IDadjustments not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'adjustments_history';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'adjustments_history_custom_id' AND [type] = 'TR')
        begin
        alter table adjustments_history ENABLE TRIGGER adjustments_history_custom_id;
        end  IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'adjustments_type_custom_id' AND [type] = 'TR')
        begin
        alter table adjustments_type ENABLE TRIGGER adjustments_type_custom_id;
        end  
                        CREATE TABLE #tmp_ins_bp
                        ( id INT identity(1,1) not null,
                        old_id VARCHAR(250) NOT NULL,
                        new_id VARCHAR(250) not null
                        );                    
                    ALTER TABLE company  NOCHECK CONSTRAINT all;
 
                            exec next_table_id @idCompany, N'bp', @next_id OUTPUT, @inc OUTPUT;
    
                            set @n_rows = (select count(*) from test_import.dbo.bp WHERE IDcompany = @idCompany) - 1
    
                            insert into #tmp_ins_bp (old_id, new_id) select IDbp, CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + ROW_NUMBER() OVER(ORDER BY IDbp ASC))) from test_import.dbo.bp WHERE IDbp not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany; 
        
                            
                            update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'bp';
                            
                            update x set IDbp = id from (SELECT tmp.new_id as id, y.IDbp from test_import.dbo.bp y, #tmp_ins_bp tmp where tmp.old_id = y.IDbp and y.IDcompany = @idCompany) x;
    
                            update x set CSM_bpid_code = id from (SELECT tmp.new_id as id, y.CSM_bpid_code from test_import.dbo.company y, #tmp_ins_bp tmp where tmp.old_id = y.CSM_bpid_code and y.IDcompany = @idCompany) x;
                            
                            ALTER TABLE company  CHECK CONSTRAINT all;
drop table #tmp_ins_bp;IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'bp_custom_id' AND [type] = 'TR')
        begin
        alter table bp ENABLE TRIGGER bp_custom_id;
        end  
                        CREATE TABLE #tmp_ins_bp_destinations
                        ( id INT identity(1,1) not null,
                        old_id VARCHAR(250) NOT NULL,
                        new_id VARCHAR(250) not null
                        );                    
                    ALTER TABLE shipments  NOCHECK CONSTRAINT all;
 
                            exec next_table_id @idCompany, N'bp_destinations', @next_id OUTPUT, @inc OUTPUT;
    
                            set @n_rows = (select count(*) from test_import.dbo.bp_destinations WHERE IDcompany = @idCompany) - 1
    
                            insert into #tmp_ins_bp_destinations (old_id, new_id) select IDdestination, CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + ROW_NUMBER() OVER(ORDER BY IDdestination ASC))) from test_import.dbo.bp_destinations WHERE IDdestination not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany; 
        
                            
                            update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'bp_destinations';
                            
                            update x set IDdestination = id from (SELECT tmp.new_id as id, y.IDdestination from test_import.dbo.bp_destinations y, #tmp_ins_bp_destinations tmp where tmp.old_id = y.IDdestination and y.IDcompany = @idCompany) x;
    
                            update x set IDdestination = id from (SELECT tmp.new_id as id, y.IDdestination from test_import.dbo.shipments y, #tmp_ins_bp_destinations tmp where tmp.old_id = y.IDdestination and y.IDcompany = @idCompany) x;
                            
                            ALTER TABLE shipments  CHECK CONSTRAINT all;
drop table #tmp_ins_bp_destinations;IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'bp_destinations_custom_id' AND [type] = 'TR')
        begin
        alter table bp_destinations ENABLE TRIGGER bp_destinations_custom_id;
        end  IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'country_custom_id' AND [type] = 'TR')
        begin
        alter table country ENABLE TRIGGER country_custom_id;
        end  
                    
                    exec next_table_id @idCompany, N'cutting_order', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.cutting_order WHERE id not like '%-%' and IDcompany = @idCompany) - 1;
                    
                    update x set id= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY id ASC) AS row_number, id
                    from test_import.dbo.cutting_order WHERE id not like '%-%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'cutting_order';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'cutting_order_custom_id' AND [type] = 'TR')
        begin
        alter table cutting_order ENABLE TRIGGER cutting_order_custom_id;
        end  
                    
                    exec next_table_id @idCompany, N'cutting_order_row', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.cutting_order_row WHERE IDcompany = @idCompany) - 1;
                    
                    update x set IDcut= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY IDcut ASC) AS row_number, IDcut
                    from test_import.dbo.cutting_order_row WHERE IDcut not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'cutting_order_row';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'cutting_order_row_custom_id' AND [type] = 'TR')
        begin
        alter table cutting_order_row ENABLE TRIGGER cutting_order_row_custom_id;
        end  
                    
                    exec next_table_id @idCompany, N'devaluation_history', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.devaluation_history WHERE IDcompany = @idCompany) - 1;
                    
                    update x set IDdevaluation= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY IDdevaluation ASC) AS row_number, IDdevaluation
                    from test_import.dbo.devaluation_history WHERE IDdevaluation not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'devaluation_history';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'devaluation_history_custom_id' AND [type] = 'TR')
        begin
        alter table devaluation_history ENABLE TRIGGER devaluation_history_custom_id;
        end  
                    
                    exec next_table_id @idCompany, N'inventory', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.inventory WHERE IDcompany = @idCompany) - 1;
                    
                    update x set IDinventory= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY IDinventory ASC) AS row_number, IDinventory
                    from test_import.dbo.inventory WHERE IDinventory not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'inventory';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'inventory_custom_id' AND [type] = 'TR')
        begin
        alter table inventory ENABLE TRIGGER inventory_custom_id;
        end  
                    
                    exec next_table_id @idCompany, N'inventory_lots_history', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.inventory_lots_history WHERE id not like '%-%' and IDcompany = @idCompany) - 1;
                    
                    update x set id= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY id ASC) AS row_number, id
                    from test_import.dbo.inventory_lots_history WHERE id not like '%-%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'inventory_lots_history';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'inventory_lots_history_custom_id' AND [type] = 'TR')
        begin
        alter table inventory_lots_history ENABLE TRIGGER inventory_lots_history_custom_id;
        end  
                        CREATE TABLE #tmp_ins_item
                        ( id INT identity(1,1) not null,
                        old_id VARCHAR(250) NOT NULL,
                        new_id VARCHAR(250) not null
                        );                    
                    ALTER TABLE item_enabled  NOCHECK CONSTRAINT all;
ALTER TABLE item_stock_limits  NOCHECK CONSTRAINT all;
ALTER TABLE lot  NOCHECK CONSTRAINT all;
ALTER TABLE order_production_components  NOCHECK CONSTRAINT all;
 
                            exec next_table_id @idCompany, N'item', @next_id OUTPUT, @inc OUTPUT;
    
                            set @n_rows = (select count(*) from test_import.dbo.item WHERE IDcompany = @idCompany) - 1
    
                            insert into #tmp_ins_item (old_id, new_id) select IDitem, CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + ROW_NUMBER() OVER(ORDER BY IDitem ASC))) from test_import.dbo.item WHERE IDitem not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany; 
                                    IF(@idCompany = 0)
                                    BEGIN
                                    insert into temp_item_id (item_id, new_item_id) select IDitem, CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + ROW_NUMBER() OVER(ORDER BY IDitem ASC))) from test_import.dbo.item WHERE IDitem not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany;
                                    END
                                    

        
                            
                            update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'item';
                            
                            update x set IDitem = id from (SELECT tmp.new_id as id, y.IDitem from test_import.dbo.item y, #tmp_ins_item tmp where tmp.old_id = y.IDitem and y.IDcompany = @idCompany) x;
    
                            update x set IDitem = id from (SELECT tmp.new_id as id, y.IDitem from test_import.dbo.item_enabled y, #tmp_ins_item tmp where tmp.old_id = y.IDitem and y.IDcompany = @idCompany) x;
                            
                            
    
                            update x set IDitem = id from (SELECT tmp.new_id as id, y.IDitem from test_import.dbo.item_stock_limits y, #tmp_ins_item tmp where tmp.old_id = y.IDitem and y.IDcompany = @idCompany) x;
                            
                            
    
                            update x set IDitem = id from (SELECT tmp.new_id as id, y.IDitem from test_import.dbo.lot y, #tmp_ins_item tmp where tmp.old_id = y.IDitem and y.IDcompany = @idCompany) x;
                            
                            
    
                            update x set IDitem = id from (SELECT tmp.new_id as id, y.IDitem from test_import.dbo.order_production_components y, #tmp_ins_item tmp where tmp.old_id = y.IDitem and y.IDcompany = @idCompany) x;
                            
                            ALTER TABLE item_enabled  CHECK CONSTRAINT all;
ALTER TABLE item_stock_limits  CHECK CONSTRAINT all;
ALTER TABLE lot  CHECK CONSTRAINT all;
ALTER TABLE order_production_components  CHECK CONSTRAINT all;
drop table #tmp_ins_item;IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'item_custom_id' AND [type] = 'TR')
        begin
        alter table item ENABLE TRIGGER item_custom_id;
        end  
                
        
                
                    update x set IDitem = id from (SELECT t.new_item_id as id, l.IDitem FROM test_import.dbo.temp_item_id t, test_import.dbo.item_enabled l WHERE t.item_id = l.IDitem) x; 
        
                update item_enabled set IDitem = null where IDitem not like '%-%' and IDitem not in (select IDitem from test_import.dbo.item ) and IDcompany = @idCompany; 
                
                
                    
                    exec next_table_id @idCompany, N'item_enabled', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.item_enabled WHERE id not like '%-%' and IDcompany = @idCompany) - 1;
                    
                    update x set id= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY id ASC) AS row_number, id
                    from test_import.dbo.item_enabled WHERE id not like '%-%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'item_enabled';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'item_enabled_custom_id' AND [type] = 'TR')
        begin
        alter table item_enabled ENABLE TRIGGER item_enabled_custom_id;
        end  
                    
                    exec next_table_id @idCompany, N'item_group', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.item_group WHERE id not like '%-%' and IDcompany = @idCompany) - 1;
                    
                    update x set id= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY id ASC) AS row_number, id
                    from test_import.dbo.item_group WHERE id not like '%-%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'item_group';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'item_group_custom_id' AND [type] = 'TR')
        begin
        alter table item_group ENABLE TRIGGER item_group_custom_id;
        end  
                
        
                
                    update x set IDitem = id from (SELECT t.new_item_id as id, l.IDitem FROM test_import.dbo.temp_item_id t, test_import.dbo.item_stock_limits l WHERE t.item_id = l.IDitem) x; 
                        CREATE TABLE #tmp_ins_item_stock_limits
                        ( id INT identity(1,1) not null,
                        old_id VARCHAR(250) NOT NULL,
                        new_id VARCHAR(250) not null
                        );                    
                     
                            exec next_table_id @idCompany, N'item_stock_limits', @next_id OUTPUT, @inc OUTPUT;
    
                            set @n_rows = (select count(*) from test_import.dbo.item_stock_limits WHERE IDcompany = @idCompany) - 1
    
                            insert into #tmp_ins_item_stock_limits (old_id, new_id) select IDitemStockLimits, CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + ROW_NUMBER() OVER(ORDER BY IDitemStockLimits ASC))) from test_import.dbo.item_stock_limits WHERE IDitemStockLimits not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany; 
        
                            
                            update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'item_stock_limits';
                            
                            update x set IDitemStockLimits = id from (SELECT tmp.new_id as id, y.IDitemStockLimits from test_import.dbo.item_stock_limits y, #tmp_ins_item_stock_limits tmp where tmp.old_id = y.IDitemStockLimits and y.IDcompany = @idCompany) x;drop table #tmp_ins_item_stock_limits;IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'item_stock_limits_custom_id' AND [type] = 'TR')
        begin
        alter table item_stock_limits ENABLE TRIGGER item_stock_limits_custom_id;
        end  
                    
                    exec next_table_id @idCompany, N'logs', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.logs WHERE IDcompany = @idCompany) - 1;
                    
                    update x set IDerr= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY IDerr ASC) AS row_number, IDerr
                    from test_import.dbo.logs WHERE IDerr not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'logs';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'logs_custom_id' AND [type] = 'TR')
        begin
        alter table logs ENABLE TRIGGER logs_custom_id;
        end  
                
        
                
                    update x set IDitem = id from (SELECT t.new_item_id as id, l.IDitem FROM test_import.dbo.temp_item_id t, test_import.dbo.lot l WHERE t.item_id = l.IDitem) x; IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'lot_custom_id' AND [type] = 'TR')
        begin
        alter table lot ENABLE TRIGGER lot_custom_id;
        end  
                    
                    exec next_table_id @idCompany, N'lot_dimension', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.lot_dimension WHERE id not like '%-%' and IDcompany = @idCompany) - 1;
                    
                    update x set id= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY id ASC) AS row_number, id
                    from test_import.dbo.lot_dimension WHERE id not like '%-%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'lot_dimension';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'lot_dimension_custom_id' AND [type] = 'TR')
        begin
        alter table lot_dimension ENABLE TRIGGER lot_dimension_custom_id;
        end  
                    
                    exec next_table_id @idCompany, N'lot_numeri_primi', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.lot_numeri_primi WHERE id not like '%-%' and IDcompany = @idCompany) - 1;
                    
                    update x set id= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY id ASC) AS row_number, id
                    from test_import.dbo.lot_numeri_primi WHERE id not like '%-%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'lot_numeri_primi';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'lot_numeri_primi_custom_id' AND [type] = 'TR')
        begin
        alter table lot_numeri_primi ENABLE TRIGGER lot_numeri_primi_custom_id;
        end  
                    
                    exec next_table_id @idCompany, N'lot_type', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.lot_type WHERE id not like '%-%' and IDcompany = @idCompany) - 1;
                    
                    update x set id= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY id ASC) AS row_number, id
                    from test_import.dbo.lot_type WHERE id not like '%-%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'lot_type';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'lot_type_custom_id' AND [type] = 'TR')
        begin
        alter table lot_type ENABLE TRIGGER lot_type_custom_id;
        end  
                    
                    exec next_table_id @idCompany, N'lot_value', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.lot_value WHERE id not like '%-%' and IDcompany = @idCompany) - 1;
                    
                    update x set id= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY id ASC) AS row_number, id
                    from test_import.dbo.lot_value WHERE id not like '%-%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'lot_value';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'lot_value_custom_id' AND [type] = 'TR')
        begin
        alter table lot_value ENABLE TRIGGER lot_value_custom_id;
        end  
        
                update material_issue_temp set IDstock = null where IDstock not like '%-%' and IDstock not in (select IDstock from test_import.dbo.stock ) and IDcompany = @idCompany; 
                
                
                    
                    exec next_table_id @idCompany, N'material_issue_temp', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.material_issue_temp WHERE IDcompany = @idCompany) - 1;
                    
                    update x set IDissue= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY IDissue ASC) AS row_number, IDissue
                    from test_import.dbo.material_issue_temp WHERE IDissue not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'material_issue_temp';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'material_issue_temp_custom_id' AND [type] = 'TR')
        begin
        alter table material_issue_temp ENABLE TRIGGER material_issue_temp_custom_id;
        end  
        
                update material_transfer_temp set IDstock = null where IDstock not like '%-%' and IDstock not in (select IDstock from test_import.dbo.stock ) and IDcompany = @idCompany; 
                
                
                    
                    exec next_table_id @idCompany, N'material_transfer_temp', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.material_transfer_temp WHERE IDcompany = @idCompany) - 1;
                    
                    update x set IDtrans= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY IDtrans ASC) AS row_number, IDtrans
                    from test_import.dbo.material_transfer_temp WHERE IDtrans not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'material_transfer_temp';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'material_transfer_temp_custom_id' AND [type] = 'TR')
        begin
        alter table material_transfer_temp ENABLE TRIGGER material_transfer_temp_custom_id;
        end  
                        CREATE TABLE #tmp_ins_stock
                        ( id INT identity(1,1) not null,
                        old_id VARCHAR(250) NOT NULL,
                        new_id VARCHAR(250) not null
                        );                    
                    ALTER TABLE order_production_components  NOCHECK CONSTRAINT all;
ALTER TABLE order_split  NOCHECK CONSTRAINT all;
 
                            exec next_table_id @idCompany, N'stock', @next_id OUTPUT, @inc OUTPUT;
    
                            set @n_rows = (select count(*) from test_import.dbo.stock WHERE IDcompany = @idCompany) - 1
    
                            insert into #tmp_ins_stock (old_id, new_id) select IDstock, CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + ROW_NUMBER() OVER(ORDER BY IDstock ASC))) from test_import.dbo.stock WHERE IDstock not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany; 
        
                            
                            update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'stock';
                            
                            update x set IDstock = id from (SELECT tmp.new_id as id, y.IDstock from test_import.dbo.stock y, #tmp_ins_stock tmp where tmp.old_id = y.IDstock and y.IDcompany = @idCompany) x;
    
                            update x set IDStock = id from (SELECT tmp.new_id as id, y.IDStock from test_import.dbo.order_production_components y, #tmp_ins_stock tmp where tmp.old_id = y.IDStock and y.IDcompany = @idCompany) x;
                            
                            
    
                            update x set IDstock = id from (SELECT tmp.new_id as id, y.IDstock from test_import.dbo.order_split y, #tmp_ins_stock tmp where tmp.old_id = y.IDstock and y.IDcompany = @idCompany) x;
                            
                            ALTER TABLE order_production_components  CHECK CONSTRAINT all;
ALTER TABLE order_split  CHECK CONSTRAINT all;
drop table #tmp_ins_stock;IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'stock_custom_id' AND [type] = 'TR')
        begin
        alter table stock ENABLE TRIGGER stock_custom_id;
        end  
                    
                    exec next_table_id @idCompany, N'transactions', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.transactions WHERE IDcompany = @idCompany) - 1;
                    
                    update x set IDtransaction= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY IDtransaction ASC) AS row_number, IDtransaction
                    from test_import.dbo.transactions WHERE IDtransaction not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'transactions';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'transactions_custom_id' AND [type] = 'TR')
        begin
        alter table transactions ENABLE TRIGGER transactions_custom_id;
        end  IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'transactions_type_custom_id' AND [type] = 'TR')
        begin
        alter table transactions_type ENABLE TRIGGER transactions_type_custom_id;
        end  
        
                update order_production set IDlocation = null where IDlocation not like '%-%' and IDlocation not in (select IDlocation from test_import.dbo.warehouse_location ) and IDcompany = @idCompany; 
                
                
                        CREATE TABLE #tmp_ins_order_production
                        ( id INT identity(1,1) not null,
                        old_id VARCHAR(250) NOT NULL,
                        new_id VARCHAR(250) not null
                        );                    
                    ALTER TABLE transactions  NOCHECK CONSTRAINT all;
 
                            exec next_table_id @idCompany, N'order_production', @next_id OUTPUT, @inc OUTPUT;
    
                            set @n_rows = (select count(*) from test_import.dbo.order_production WHERE IDcompany = @idCompany) - 1
    
                            insert into #tmp_ins_order_production (old_id, new_id) select IDord, CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + ROW_NUMBER() OVER(ORDER BY IDord ASC))) from test_import.dbo.order_production WHERE IDord not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany; 
        
                            
                            update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'order_production';
                            
                            update x set IDord = id from (SELECT tmp.new_id as id, y.IDord from test_import.dbo.order_production y, #tmp_ins_order_production tmp where tmp.old_id = y.IDord and y.IDcompany = @idCompany) x;
    
                            update x set IDprodOrd = id from (SELECT tmp.new_id as id, y.IDprodOrd from test_import.dbo.transactions y, #tmp_ins_order_production tmp where tmp.old_id = y.IDprodOrd and y.IDcompany = @idCompany) x;
                            
                            ALTER TABLE transactions  CHECK CONSTRAINT all;
drop table #tmp_ins_order_production;IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'order_production_custom_id' AND [type] = 'TR')
        begin
        alter table order_production ENABLE TRIGGER order_production_custom_id;
        end  
                
        
                
                    update x set IDitem = id from (SELECT t.new_item_id as id, l.IDitem FROM test_import.dbo.temp_item_id t, test_import.dbo.order_production_components l WHERE t.item_id = l.IDitem) x; 
        
                update order_production_components set IDstock = null where IDstock not like '%-%' and IDstock not in (select IDstock from test_import.dbo.stock ) and IDcompany = @idCompany; 
                
                
                        CREATE TABLE #tmp_ins_order_production_components
                        ( id INT identity(1,1) not null,
                        old_id VARCHAR(250) NOT NULL,
                        new_id VARCHAR(250) not null
                        );                    
                     
                            exec next_table_id @idCompany, N'order_production_components', @next_id OUTPUT, @inc OUTPUT;
    
                            set @n_rows = (select count(*) from test_import.dbo.order_production_components WHERE IDcompany = @idCompany) - 1
    
                            insert into #tmp_ins_order_production_components (old_id, new_id) select IDcomp, CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + ROW_NUMBER() OVER(ORDER BY IDcomp ASC))) from test_import.dbo.order_production_components WHERE IDcomp not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany; 
        
                            
                            update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'order_production_components';
                            
                            update x set IDcomp = id from (SELECT tmp.new_id as id, y.IDcomp from test_import.dbo.order_production_components y, #tmp_ins_order_production_components tmp where tmp.old_id = y.IDcomp and y.IDcompany = @idCompany) x;drop table #tmp_ins_order_production_components;IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'order_production_components_custom_id' AND [type] = 'TR')
        begin
        alter table order_production_components ENABLE TRIGGER order_production_components_custom_id;
        end  
        
                update order_split set IDstock = null where IDstock not like '%-%' and IDstock not in (select IDstock from test_import.dbo.stock ) and IDcompany = @idCompany; 
                
                
                    
                    exec next_table_id @idCompany, N'order_split', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.order_split WHERE IDcompany = @idCompany) - 1;
                    
                    update x set IDord= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY IDord ASC) AS row_number, IDord
                    from test_import.dbo.order_split WHERE IDord not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'order_split';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'order_split_custom_id' AND [type] = 'TR')
        begin
        alter table order_split ENABLE TRIGGER order_split_custom_id;
        end  
                    
                    exec next_table_id @idCompany, N'order_split_row', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.order_split_row WHERE IDcompany = @idCompany) - 1;
                    
                    update x set IDRowSplit= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY IDRowSplit ASC) AS row_number, IDRowSplit
                    from test_import.dbo.order_split_row WHERE IDRowSplit not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'order_split_row';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'order_split_row_custom_id' AND [type] = 'TR')
        begin
        alter table order_split_row ENABLE TRIGGER order_split_row_custom_id;
        end  
                    
                    exec next_table_id @idCompany, N'receptions', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.receptions WHERE IDcompany = @idCompany) - 1;
                    
                    update x set IDreception= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY IDreception ASC) AS row_number, IDreception
                    from test_import.dbo.receptions WHERE IDreception not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'receptions';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'receptions_custom_id' AND [type] = 'TR')
        begin
        alter table receptions ENABLE TRIGGER receptions_custom_id;
        end  
                    
                    exec next_table_id @idCompany, N'shipments', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from test_import.dbo.shipments WHERE IDcompany = @idCompany) - 1;
                    
                    update x set IDshipments= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY IDshipments ASC) AS row_number, IDshipments
                    from test_import.dbo.shipments WHERE IDshipments not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = 'shipments';IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'shipments_custom_id' AND [type] = 'TR')
        begin
        alter table shipments ENABLE TRIGGER shipments_custom_id;
        end  IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'um_custom_id' AND [type] = 'TR')
        begin
        alter table um ENABLE TRIGGER um_custom_id;
        end  IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'um_dimension_custom_id' AND [type] = 'TR')
        begin
        alter table um_dimension ENABLE TRIGGER um_dimension_custom_id;
        end  COMMIT;
        

        END TRY
        BEGIN CATCH
            ROLLBACK;
            EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT all';

  
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'company_custom_id' AND [type] = 'TR')
               begin
               alter table company ENABLE TRIGGER company_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'warehouse_custom_id' AND [type] = 'TR')
               begin
               alter table warehouse ENABLE TRIGGER warehouse_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'warehouse_location_custom_id' AND [type] = 'TR')
               begin
               alter table warehouse_location ENABLE TRIGGER warehouse_location_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'warehouse_location_type_custom_id' AND [type] = 'TR')
               begin
               alter table warehouse_location_type ENABLE TRIGGER warehouse_location_type_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'WAC_year_layers_custom_id' AND [type] = 'TR')
               begin
               alter table WAC_year_layers ENABLE TRIGGER WAC_year_layers_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'WAC_year_layers_item_detail_custom_id' AND [type] = 'TR')
               begin
               alter table WAC_year_layers_item_detail ENABLE TRIGGER WAC_year_layers_item_detail_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'adjustments_history_custom_id' AND [type] = 'TR')
               begin
               alter table adjustments_history ENABLE TRIGGER adjustments_history_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'adjustments_type_custom_id' AND [type] = 'TR')
               begin
               alter table adjustments_type ENABLE TRIGGER adjustments_type_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'bp_custom_id' AND [type] = 'TR')
               begin
               alter table bp ENABLE TRIGGER bp_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'bp_destinations_custom_id' AND [type] = 'TR')
               begin
               alter table bp_destinations ENABLE TRIGGER bp_destinations_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'country_custom_id' AND [type] = 'TR')
               begin
               alter table country ENABLE TRIGGER country_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'cutting_order_custom_id' AND [type] = 'TR')
               begin
               alter table cutting_order ENABLE TRIGGER cutting_order_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'cutting_order_row_custom_id' AND [type] = 'TR')
               begin
               alter table cutting_order_row ENABLE TRIGGER cutting_order_row_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'devaluation_history_custom_id' AND [type] = 'TR')
               begin
               alter table devaluation_history ENABLE TRIGGER devaluation_history_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'inventory_custom_id' AND [type] = 'TR')
               begin
               alter table inventory ENABLE TRIGGER inventory_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'inventory_lots_history_custom_id' AND [type] = 'TR')
               begin
               alter table inventory_lots_history ENABLE TRIGGER inventory_lots_history_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'item_custom_id' AND [type] = 'TR')
               begin
               alter table item ENABLE TRIGGER item_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'item_enabled_custom_id' AND [type] = 'TR')
               begin
               alter table item_enabled ENABLE TRIGGER item_enabled_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'item_group_custom_id' AND [type] = 'TR')
               begin
               alter table item_group ENABLE TRIGGER item_group_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'item_stock_limits_custom_id' AND [type] = 'TR')
               begin
               alter table item_stock_limits ENABLE TRIGGER item_stock_limits_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'logs_custom_id' AND [type] = 'TR')
               begin
               alter table logs ENABLE TRIGGER logs_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'lot_custom_id' AND [type] = 'TR')
               begin
               alter table lot ENABLE TRIGGER lot_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'lot_dimension_custom_id' AND [type] = 'TR')
               begin
               alter table lot_dimension ENABLE TRIGGER lot_dimension_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'lot_numeri_primi_custom_id' AND [type] = 'TR')
               begin
               alter table lot_numeri_primi ENABLE TRIGGER lot_numeri_primi_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'lot_type_custom_id' AND [type] = 'TR')
               begin
               alter table lot_type ENABLE TRIGGER lot_type_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'lot_value_custom_id' AND [type] = 'TR')
               begin
               alter table lot_value ENABLE TRIGGER lot_value_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'material_issue_temp_custom_id' AND [type] = 'TR')
               begin
               alter table material_issue_temp ENABLE TRIGGER material_issue_temp_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'material_transfer_temp_custom_id' AND [type] = 'TR')
               begin
               alter table material_transfer_temp ENABLE TRIGGER material_transfer_temp_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'stock_custom_id' AND [type] = 'TR')
               begin
               alter table stock ENABLE TRIGGER stock_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'transactions_custom_id' AND [type] = 'TR')
               begin
               alter table transactions ENABLE TRIGGER transactions_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'transactions_type_custom_id' AND [type] = 'TR')
               begin
               alter table transactions_type ENABLE TRIGGER transactions_type_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'order_production_custom_id' AND [type] = 'TR')
               begin
               alter table order_production ENABLE TRIGGER order_production_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'order_production_components_custom_id' AND [type] = 'TR')
               begin
               alter table order_production_components ENABLE TRIGGER order_production_components_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'order_split_custom_id' AND [type] = 'TR')
               begin
               alter table order_split ENABLE TRIGGER order_split_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'order_split_row_custom_id' AND [type] = 'TR')
               begin
               alter table order_split_row ENABLE TRIGGER order_split_row_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'receptions_custom_id' AND [type] = 'TR')
               begin
               alter table receptions ENABLE TRIGGER receptions_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'shipments_custom_id' AND [type] = 'TR')
               begin
               alter table shipments ENABLE TRIGGER shipments_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'um_custom_id' AND [type] = 'TR')
               begin
               alter table um ENABLE TRIGGER um_custom_id;
               end      
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'um_dimension_custom_id' AND [type] = 'TR')
               begin
               alter table um_dimension ENABLE TRIGGER um_dimension_custom_id;
               end    

          

            SELECT
    ERROR_NUMBER() AS ErrorNumber,
    ERROR_STATE() AS ErrorState,
    ERROR_SEVERITY() AS ErrorSeverity,
    ERROR_PROCEDURE() AS ErrorProcedure,
    ERROR_LINE() AS ErrorLine,
    ERROR_MESSAGE() AS ErrorMessage;
        END CATCH
        END;
GO
/****** Object:  StoredProcedure [dbo].[ZZZ_sp_IMPORT_USA_excelStock]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE  PROCEDURE [dbo].[ZZZ_sp_IMPORT_USA_excelStock] 
as
BEGIN

--creazione della tabella sono ne caso in cui non esista se non esiste
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ZZZ_importExcelUSA20190722' AND xtype='U')
CREATE TABLE [dbo].[ZZZ_importExcelUSA20190722](
	[Product Code] [varchar](50) NULL,
	[Lot #] nvarchar(100) NULL,
	[Invoice #] nvarchar(100) NULL,
	[WH] nvarchar(100) NULL,
	[Location] nvarchar(100) NULL,
	[Package or Cut roll #] nvarchar(100) NULL,
	[Pcs ] [varchar](50) NULL,
	[a Dim 1  Ft  ] nvarchar(100) NULL,
	[a Dim 2  in  ] nvarchar(100) NULL,
	[a Value  $  ] nvarchar(100) NULL,
	[b Dim 1  Ft  ] nvarchar(100) NULL,
	[b Dim 2  in  ] nvarchar(100) NULL,
	[b Value  $  ] nvarchar(100) NULL,
	[c Dim 1  Ft  ] nvarchar(100) NULL,
	[c Dim 2  in  ] nvarchar(100) NULL,
	[c Value  $  ] nvarchar(100) NULL,
	[d Dim 1  Ft  ] nvarchar(100) NULL,
	[d Dim 2  in  ] nvarchar(100) NULL,
	[d Value  $  ] nvarchar(100) NULL,
	[e Dim 1  Ft  ] nvarchar(100) NULL,
	[e Dim 2  in  ] nvarchar(100) NULL,
	[e Value  $  ] nvarchar(100) NULL
/*	[f Dim 1  Ft  ] nvarchar(100) NULL,
	[f Dim 2  in  ] nvarchar(100) NULL,
	[f Value  $  ] nvarchar(100) NULL,
	[g Dim 1  Ft  ] nvarchar(100) NULL,
	[g Dim 2  in  ] nvarchar(100) NULL,
	[g Value  $  ] nvarchar(100) NULL,
	[h Dim 1  Ft  ] nvarchar(100) NULL,
	[h Dim 2  in  ] nvarchar(100) NULL,
	[h Value  $  ] nvarchar(100) NULL,
	[i Dim 1  Ft  ] nvarchar(100) NULL,
	[i Dim 2  in  ] nvarchar(100) NULL,
	[i Value  $  ] nvarchar(100) NULL,
	[Note] nvarchar (100) NULL */
) ON [PRIMARY]

--pulizia della tabella 
truncate TABLE [dbo].ZZZ_importExcelUSA20190722
--caricamento dal file csv
BULK
INSERT [dbo].[ZZZ_importExcelUSA20190722]
FROM 'c:\ZZZ_importExcelUSA20190722.csv'
WITH
(
---	il rowterminator NON FUNZIONA, quindi il numero delle colonne deve essere uguale a quello del fogli excel
	FIRSTROW = 2,
	FIELDTERMINATOR = ';',
	--ERRORFILE = 'C:\SchoolsErrorRows.csv',
	ROWTERMINATOR = '\n'   --Use to shift the control to next row
	--ROWTERMINATOR = '0x0A'
	--ROWTERMINATOR = '0x0a'
	--ROWTERMINATOR = '\r\n'
)

--pulizia dei campi (i volori vuoti hanno un - dentro, e i i costi hanno $)
  update [dbo].[ZZZ_importExcelUSA20190722]
  set 
 [a Dim 1  Ft  ] = replace ([a Dim 1  Ft  ],'-','')
,[a Dim 2  in  ] = replace ([a Dim 2  in  ],'-','')
,[a Value  $  ] = replace ([a Value  $  ],'-','')
,[b Dim 1  Ft  ] = replace ([b Dim 1  Ft  ],'-','')
,[b Dim 2  in  ] = replace ([b Dim 2  in  ],'-','')
,[b Value  $  ] = replace ([b Value  $  ],'-','')
,[c Dim 1  Ft  ] = replace ([c Dim 1  Ft  ],'-','')
,[c Dim 2  in  ] = replace ([c Dim 2  in  ],'-','')
,[c Value  $  ] = replace ([c Value  $  ],'-','')
,[d Dim 1  Ft  ] = replace ([d Dim 1  Ft  ],'-','')
,[d Dim 2  in  ] = replace ([d Dim 2  in  ],'-','')
,[d Value  $  ] = replace ([d Value  $  ],'-','')
,[e Dim 1  Ft  ] = replace ([e Dim 1  Ft  ],'-','')
,[e Dim 2  in  ] = replace ([e Dim 2  in  ],'-','')
,[e Value  $  ] = replace ([e Value  $  ],'-','')
/*,[f Dim 1  Ft  ] = replace ([f Dim 1  Ft  ],'-','')
,[f Dim 2  in  ] = replace ([f Dim 2  in  ],'-','')
,[f Value  $  ] = replace ([f Value  $  ],'-','')
,[g Dim 1  Ft  ] = replace ([g Dim 1  Ft  ],'-','')
,[g Dim 2  in  ] = replace ([g Dim 2  in  ],'-','')
,[g Value  $  ] = replace ([g Value  $  ],'-','')
,[h Dim 1  Ft  ] = replace ([h Dim 1  Ft  ],'-','')
,[h Dim 2  in  ] = replace ([h Dim 2  in  ],'-','')
,[h Value  $  ] = replace ([h Value  $  ],'-','')
,[i Dim 1  Ft  ] = replace ([i Dim 1  Ft  ],'-','')
,[i Dim 2  in  ] = replace ([i Dim 2  in  ],'-','')
,[i Value  $  ] = replace ([i Value  $  ],'-','') */
/* Rimozione del simbolo del dollaro */
 update [dbo].[ZZZ_importExcelUSA20190722]
 set 
 [a Value  $  ] = replace ([a Value  $  ],'$','')
,[b Value  $  ] = replace ([b Value  $  ],'$','')
,[c Value  $  ] = replace ([c Value  $  ],'$','')
,[d Value  $  ] = replace ([d Value  $  ],'$','')
,[e Value  $  ] = replace ([e Value  $  ],'$','')
/*,[f Value  $  ] = replace ([f Value  $  ],'$','')
,[g Value  $  ] = replace ([g Value  $  ],'$','')
,[h Value  $  ] = replace ([h Value  $  ],'$','')
,[i Value  $  ] = replace ([i Value  $  ],'$','') */

/* procedura per rendere univoco il campo "Package or Cut roll #"
che in usa al momento è l'unioco codice per loro facilemte
riconoscibile sui nastri (la nostra etichetta), questo campo lo useremo poi 
come lotto origine anche per gli step roll */
declare @record int = 0
declare @currentLot nvarchar(20) = ''
declare @package nvarchar(100) = ''
select @record = COUNT(*)
from dbo.ZZZ_importExcelUSA20190722
select @record
while @record <>  0
begin	
	select @currentLot = [Lot #] , @package = ltrim(rtrim([Package or Cut roll #]))
	from dbo.ZZZ_importExcelUSA20190722
	ORDER BY [Lot #]  OFFSET @record - 1 ROWS FETCH NEXT 1 ROWS ONLY
	--if (@package <> '')
	--begin
		update dbo.ZZZ_importExcelUSA20190722 
		set [Package or Cut roll #] = [Package or Cut roll #] + '-imp' + cast(@record as nvarchar)
		where [Lot #] = @currentLot
	--end
	set @record = @record - 1
end
end;
GO
/****** Object:  StoredProcedure [dbo].[ZZZ_sp_IMPORT_USA_step0_excelToCSM]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create  PROCEDURE [dbo].[ZZZ_sp_IMPORT_USA_step0_excelToCSM] 
as
BEGIN
--creazione della tabella sono ne caso in cui non esista se non esiste
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ZZZ_importExcelUSA20190722' AND xtype='U')
CREATE TABLE [dbo].[ZZZ_importExcelUSA20190722](
	[Product Code] [varchar](50) NULL,
	[Lot #] nvarchar(100) NULL,
	[Invoice #] nvarchar(100) NULL,
	[WH] nvarchar(100) NULL,
	[Location] nvarchar(100) NULL,
	[Package or Cut roll #] nvarchar(100) NULL,
	[Pcs ] [varchar](50) NULL,
	[a Dim 1  Ft  ] nvarchar(100) NULL,
	[a Dim 2  in  ] nvarchar(100) NULL,
	[a Value  $  ] nvarchar(100) NULL,
	[b Dim 1  Ft  ] nvarchar(100) NULL,
	[b Dim 2  in  ] nvarchar(100) NULL,
	[b Value  $  ] nvarchar(100) NULL,
	[c Dim 1  Ft  ] nvarchar(100) NULL,
	[c Dim 2  in  ] nvarchar(100) NULL,
	[c Value  $  ] nvarchar(100) NULL,
	[d Dim 1  Ft  ] nvarchar(100) NULL,
	[d Dim 2  in  ] nvarchar(100) NULL,
	[d Value  $  ] nvarchar(100) NULL,
	[e Dim 1  Ft  ] nvarchar(100) NULL,
	[e Dim 2  in  ] nvarchar(100) NULL,
	[e Value  $  ] nvarchar(100) NULL
/*	[f Dim 1  Ft  ] nvarchar(100) NULL,
	[f Dim 2  in  ] nvarchar(100) NULL,
	[f Value  $  ] nvarchar(100) NULL,
	[g Dim 1  Ft  ] nvarchar(100) NULL,
	[g Dim 2  in  ] nvarchar(100) NULL,
	[g Value  $  ] nvarchar(100) NULL,
	[h Dim 1  Ft  ] nvarchar(100) NULL,
	[h Dim 2  in  ] nvarchar(100) NULL,
	[h Value  $  ] nvarchar(100) NULL,
	[i Dim 1  Ft  ] nvarchar(100) NULL,
	[i Dim 2  in  ] nvarchar(100) NULL,
	[i Value  $  ] nvarchar(100) NULL,
	[Note] nvarchar (100) NULL */
) ON [PRIMARY]

--pulizia della tabella 
truncate TABLE [dbo].ZZZ_importExcelUSA20190722
--caricamento dal file csv
BULK
INSERT [dbo].[ZZZ_importExcelUSA20190722]
FROM 'c:\ZZZ_importExcelUSA20190722.csv'
WITH
(
---	il rowterminator NON FUNZIONA, quindi il numero delle colonne deve essere uguale a quello del fogli excel
	FIRSTROW = 2,
	FIELDTERMINATOR = ';',
	--ERRORFILE = 'C:\SchoolsErrorRows.csv',
	ROWTERMINATOR = '\n'   --Use to shift the control to next row
	--ROWTERMINATOR = '0x0A'
	--ROWTERMINATOR = '0x0a'
	--ROWTERMINATOR = '\r\n'
)

end;
GO
/****** Object:  StoredProcedure [dbo].[ZZZ_sp_IMPORT_USA_step1_clerData]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE  PROCEDURE [dbo].[ZZZ_sp_IMPORT_USA_step1_clerData] 
as
BEGIN
--Eliminazione righe senza il campo che usiamo come lotto univoco compilato (fare prima una select e mandare lista)
delete from [dbo].[ZZZ_importExcelUSA_20200505] where ltrim(rtrim([Package or Cut roll #])) = ''
--Eliminazione righe che hanno il codice "univoco" duplicato (fare prima una select e mandare la lista)
delete from [dbo].[ZZZ_importExcelUSA_20200505] where [Package or Cut roll #] in 
(select [Package or Cut roll #] FROM [dbo].[ZZZ_importExcelUSA_20200505] group by [Package or Cut roll #] having count(*) > 1)
--Eliminazione di MN e IG, come definito se li caricheranno loro manualmente 
delete from [dbo].[ZZZ_importExcelUSA_20200505] where [Package or Cut roll #] in (
SELECT [Package or Cut roll #] FROM [dbo].[ZZZ_importExcelUSA_20200505] where [Product Code] like 'MN%')
/*
delete from [dbo].[ZZZ_importExcelUSA_20200505] where [Package or Cut roll #] in (
SELECT [Package or Cut roll #] FROM [dbo].[ZZZ_importExcelUSA_20200505] where [Product Code] like 'IG%')
*/
--1)  Verifica che i magazzini di import esistano tutti
--2) Verifica che le ubicazioni di import esistano tutti
/* Query di esempio: SELECT 846, 11, [Location] [Location] FROM [csmTEST_2020].[dbo].[ZZZ_importExcelUSA_20200505] 
WHERE [Location] NOT IN (select [desc] from warehouse_location where IDcompany = 846) group by [Location] */
--3) Creazione delle ubicazione STANDAR: Load, Shipment, e mettere il flag su load.
--4) Verifica che il codice lotto (il codice univoco che prendiamo come codice lotto) non abbia caratteri che possano 
-- creare problemi (- , . ecc )
/* update  [csmTEST_2020].[dbo].[ZZZ_importExcelUSA_20200505] 
set [Package or Cut roll #] = replace([Package or Cut roll #],'-','_') */
/* delete from [csmTEST_2020].[dbo].[ZZZ_importExcelUSA_20200505]  where [ Dim 1  MM} a ] = ' 305 ' */
--pulizia dei campi (i volori vuoti hanno un - dentro, e i i costi hanno $)
  update [dbo].[ZZZ_importExcelUSA_20200505]
  set 
      ZZZ_importExcelUSA_20200505.[Dim 1  MM} a] = replace (ZZZ_importExcelUSA_20200505.[Dim 1  MM} a],'-','')
      ,ZZZ_importExcelUSA_20200505.[Dim 2  MM  a] = replace (ZZZ_importExcelUSA_20200505.[Dim 2  MM  a],'-','')
      ,ZZZ_importExcelUSA_20200505.[MM Total a] = replace (ZZZ_importExcelUSA_20200505.[MM Total a],'-','')
      ,ZZZ_importExcelUSA_20200505.[Dim 1  MM} b] = replace (ZZZ_importExcelUSA_20200505.[Dim 1  MM} b],'-','')
      ,ZZZ_importExcelUSA_20200505.[Dim 2  MM  b] = replace (ZZZ_importExcelUSA_20200505.[Dim 2  MM  b],'-','')
      ,ZZZ_importExcelUSA_20200505.[MM Total b] = replace (ZZZ_importExcelUSA_20200505.[MM Total b],'-','')
      ,ZZZ_importExcelUSA_20200505.[Dim 1  MM} c] = replace (ZZZ_importExcelUSA_20200505.[Dim 1  MM} c],'-','')
      ,ZZZ_importExcelUSA_20200505.[Dim 2  MM  c] = replace (ZZZ_importExcelUSA_20200505.[Dim 2  MM  c],'-','')
      ,ZZZ_importExcelUSA_20200505.[MM Total c] = replace (ZZZ_importExcelUSA_20200505.[MM Total c],'-','')
      ,ZZZ_importExcelUSA_20200505.[Dim 1  MM} d] = replace (ZZZ_importExcelUSA_20200505.[Dim 1  MM} d],'-','')
      ,ZZZ_importExcelUSA_20200505.[Dim 2  MM  d] = replace (ZZZ_importExcelUSA_20200505.[Dim 2  MM  d],'-','')
	  ,ZZZ_importExcelUSA_20200505.[MM Total d] = replace (ZZZ_importExcelUSA_20200505.[MM Total d],'-','')
      ,ZZZ_importExcelUSA_20200505.[MM Grand Total] = replace (ZZZ_importExcelUSA_20200505.[MM Grand Total],'-','')
/* Rimozione del simbolo del dollaro */
/*
 update [dbo].[ZZZ_importExcelUSA_20200505]
 set 
   [ MM Total a ] = replace ([ MM Total a ] ,'$','')
        ,[MM Total b] = replace ([MM Total b],'$','')
		,[MM Total c] = replace ([MM Total c],'$','')
		,[MM Total d] = replace ([MM Total d],'$','')
        ,[MM Grand Total] = replace ([MM Grand Total],'$','')
      ,[ Sum of value  $  ] = replace ([ Sum of value  $  ],'$','')
*/
/* Rimozione del punto usato come separatore delle migliaia */
 update [dbo].[ZZZ_importExcelUSA_20200505]
 set
       ZZZ_importExcelUSA_20200505.[Dim 1  MM} a] = replace (ZZZ_importExcelUSA_20200505.[Dim 1  MM} a],'.','')
      ,ZZZ_importExcelUSA_20200505.[Dim 2  MM  a] = replace (ZZZ_importExcelUSA_20200505.[Dim 2  MM  a],'.','')
      ,ZZZ_importExcelUSA_20200505.[Dim 1  MM} b] = replace (ZZZ_importExcelUSA_20200505.[Dim 1  MM} b],'.','')
      ,ZZZ_importExcelUSA_20200505.[Dim 2  MM  b] = replace (ZZZ_importExcelUSA_20200505.[Dim 2  MM  b],'.','')     
      ,ZZZ_importExcelUSA_20200505.[Dim 1  MM} c] = replace (ZZZ_importExcelUSA_20200505.[Dim 1  MM} c],'.','')
      ,ZZZ_importExcelUSA_20200505.[Dim 2  MM  c] = replace (ZZZ_importExcelUSA_20200505.[Dim 2  MM  c],'.','')     
      ,ZZZ_importExcelUSA_20200505.[Dim 1  MM} d] = replace (ZZZ_importExcelUSA_20200505.[Dim 1  MM} d],'.','')
      ,ZZZ_importExcelUSA_20200505.[Dim 2  MM  d] = replace (ZZZ_importExcelUSA_20200505.[Dim 2  MM  d],'.','')         
		/*
		,[ MM Total a ] = replace ([ MM Total a ] ,'.','')
        ,[MM Total b] = replace ([MM Total b],'.','')
		,[MM Total c] = replace ([MM Total c],'.','')
		,[MM Total d] = replace ([MM Total d],'.','')
        ,[MM Grand Total] = replace ([MM Grand Total],'.','')
      ,[ Sum of value  $  ] = replace ([ Sum of value  $  ],'.','') */
        ,ZZZ_importExcelUSA_20200505.[MM Total d] = replace (ZZZ_importExcelUSA_20200505.[MM Total d],'.','')
      ,ZZZ_importExcelUSA_20200505.[MM Grand Total] = replace (ZZZ_importExcelUSA_20200505.[MM Grand Total],'.','') 
update [dbo].[ZZZ_importExcelUSA_20200505] set Notes = replace(Notes,'#N/D',''), [Lot #] = replace([Lot #],'#N/D','')

/* Pulizia dei null ecc .. */
/*
update [dbo].[ZZZ_importExcelUSA_20200505] set [ Dim 1  MM} a ] = 0  where ltrim(rtrim(isnull([ Dim 1  MM} a ],''))) = ''
update [dbo].[ZZZ_importExcelUSA_20200505] set [ Dim 2  MM  a ] = 0  where ltrim(rtrim(isnull([ Dim 2  MM  a ],''))) = ''  
update [dbo].[ZZZ_importExcelUSA_20200505] set [ Dim 1  MM} b ] = 0  where ltrim(rtrim(isnull([ Dim 1  MM} b ],''))) = ''
update [dbo].[ZZZ_importExcelUSA_20200505] set [ Dim 2  MM  b ] = 0  where ltrim(rtrim(isnull([ Dim 2  MM  b ],''))) = ''  
update [dbo].[ZZZ_importExcelUSA_20200505] set [ Dim 1  MM} c ] = 0  where ltrim(rtrim(isnull([ Dim 1  MM} c ],''))) = ''
update [dbo].[ZZZ_importExcelUSA_20200505] set [ Dim 2  MM  c ] = 0  where ltrim(rtrim(isnull([ Dim 2  MM  c ],''))) = ''  
update [dbo].[ZZZ_importExcelUSA_20200505] set [ Dim 1  MM} d ] = 0  where ltrim(rtrim(isnull([ Dim 1  MM} d ],''))) = ''
update [dbo].[ZZZ_importExcelUSA_20200505] set [ Dim 2  MM  d ] = 0  where ltrim(rtrim(isnull([ Dim 2  MM  d ],''))) = ''  
*/
/* procedura per rendere univoco il campo "Package or Cut roll #"
che in usa al momento è l'unioco codice per loro facilemte
riconoscibile sui nastri (la nostra etichetta), questo campo lo useremo poi 
come lotto origine anche per gli step roll */
/*
declare @record int = 0
declare @currentLot nvarchar(20) = ''
declare @package nvarchar(100) = ''
select @record = COUNT(*)
from dbo.ZZZ_importExcelUSA20190722
select @record
while @record <>  0
begin	
	select @currentLot = [Lot #] , @package = ltrim(rtrim([Package or Cut roll #]))
	from dbo.ZZZ_importExcelUSA20190722
	ORDER BY [Lot #]  OFFSET @record - 1 ROWS FETCH NEXT 1 ROWS ONLY
	--if (@package <> '')
	--begin
		update dbo.ZZZ_importExcelUSA20190722 
		set [Package or Cut roll #] = [Package or Cut roll #] + '-imp' + cast(@record as nvarchar)
		where [Lot #] = @currentLot
	--end
	set @record = @record - 1
end
*/
end;
GO
/****** Object:  StoredProcedure [dbo].[ZZZ_sp_IMPORT_USA_step2_LoadCsmTable]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[ZZZ_sp_IMPORT_USA_step2_LoadCsmTable]
AS
BEGIN
declare @recodDaImportare int = 0
declare @ln_IDitem int = 0
declare @ln_qty float = 0
declare @ln_um nvarchar (3) = ''
declare @ln_lot nvarchar (20) = ''
declare @lotOri nvarchar (20) = ''
--declare @NuovoLotto nvarchar (20) = ''
declare @getdate DATETIME = getdate()
declare @datalotto DATETIME = getdate()
declare @valLot float
declare @valLotU float  
declare @lotOriInfo nvarchar (100)
declare @note nvarchar (100)
declare @step int
declare @stepOrd int
declare @la float = 0
declare @lu float = 0
declare @pz float = 0
declare @de float = 0
declare @di float = 0
declare @idwh int = 0
declare @idloc int = 0
select @recodDaImportare = COUNT(*)
from ZZZ_vw_IMPORT_USA_excelStock_1 exc
inner join item on exc.[Product Code] = item.item 
where qty is not null
and exc.[Lot #] not in (select IDlot from dbo.lot where IDcompany = 846) /* Scarto quelli già inseriti */
while @recodDaImportare <>  0
begin
	select top 1  @ln_IDitem = itemcsm.IDitem , @ln_qty = stockExcel.qty, @ln_um = stockExcel.um, @ln_lot = [Lot #], @lotOri = lotOri
	,@la = LA
	,@lu = LU
	,@pz = PZ
	,@note = [notes]
	,@datalotto = [date_lot]
	,@valLot = Val
	,@lotOriInfo = [lotOri]
	,@step = step
	,@stepOrd = stepOrd
	,@idwh = idwhcsm
	,@idloc = idloccsm
	from ZZZ_vw_IMPORT_USA_excelStock_1 stockExcel
	inner join item itemcsm on stockExcel.[Product Code] = itemcsm.item
	where stockExcel.[Lot #] not in (select IDlot from dbo.lot where IDcompany = 846) /* Scarto quelli già inseriti */
	and qty is not null
	and [Lot #] is not null
	/* Generazione del nuovo lotto da inseirire
	DECLARE @NEW_lotCode nvarchar(20) = @ln_lot
	set @NuovoLotto = @ln_lot
	EXEC sp_generateNewLotCode 845 ,1,'A', @NEW_lotCode OUTPUT
	SELECT @NuovoLotto = @NEW_lotCode */
	/* Inserimento del lotto in anagrafica */
	exec dbo.sp_lotInserimento 846, @ln_lot, @ln_IDitem, @getdate, @datalotto,@lotOri, @ln_lot, @lotOriInfo, 0, @note, @step,@stepOrd,
	@DE,@DI,@LA,@LU,@PZ,0,0, '','', 0
	-- Inserimento lotto in stock e nelle transazioni 
	exec dbo.sp_main_stock_transaction 846, @ln_lot, @idwh, @idloc, @ln_um,'+', @ln_qty, 1, 'boggiani', 'ICT Import', 1, 0
	/* Inserimento valore lotto */
	if (@valLot = 0 ) begin 
		set @valLotU = 0
	end else begin
		set @valLotU = @valLot / @ln_qty
	end
	insert into dbo.lot_value select 846, @ln_lot, @getdate, @valLotU, 'boggiani', 0,'ICT Import'
 
	set @recodDaImportare = @recodDaImportare - 1
end
	
	/* Set degli step roll, verificare la possibilità di correggere direttamente sopra */
	update lot 
	set IDlot_padre = substring(IDlot, 0, CHARINDEX('x',IDlot) + 1) + cast(0 as varchar(1)),
	stepRoll = 1
	where IDcompany = 846 and IDlot like '%x%'
	
   /* 2019 12 16, fix per gli step roll USA
  update [dbo].[lot]
  set stepRoll = 0
  where IDcompany = 846
  and IDlot_origine not in (select IDlot_origine from [dbo].[lot] where IDcompany = 846 and IDlot like '%x1')
   */
END;
GO
/****** Object:  StoredProcedure [dbo].[ZZZ_sp_IMPORT_USA_toCsmTable]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[ZZZ_sp_IMPORT_USA_toCsmTable]
AS
BEGIN

declare @recodDaImportare int = 0
declare @ln_IDitem int = 0
declare @ln_qty float = 0
declare @ln_um nvarchar (3) = ''
declare @ln_lot nvarchar (20) = ''
declare @lotOri nvarchar (20) = ''
--declare @NuovoLotto nvarchar (20) = ''
declare @getdate DATETIME = getdate()
declare @datalotto DATETIME = getdate()
declare @valLot float
declare @valLotU float  
declare @lotOriInfo nvarchar (100)
declare @note nvarchar (100)
declare @step int
declare @stepOrd int
declare @la float = 0
declare @lu float = 0
declare @pz float = 0
declare @de float = 0
declare @di float = 0
declare @idwh int = 0
declare @idloc int = 0
select @recodDaImportare = COUNT(*)
from ZZZ_vw_IMPORT_USA_excelStock_1 exc
inner join item on exc.[Product Code] = item.item 
where qty is not null


while @recodDaImportare <>  0
begin
	select top 1  @ln_IDitem = itemcsm.IDitem , @ln_qty = stockExcel.qty, @ln_um = stockExcel.um, @ln_lot = [Lot #], @lotOri = lotOri
	,@la = LA
	,@lu = LU
	,@pz = PZ
	--,@note = note
	,@datalotto = lotdate
	,@valLot = Val
	,@lotOriInfo = [Package or Cut roll #]
	,@step = step
	,@stepOrd = stepOrd
	,@idwh = idwhcsm
	,@idloc = idloccsm
	from ZZZ_vw_IMPORT_USA_excelStock_1 stockExcel
	inner join item itemcsm on stockExcel.[Product Code] = itemcsm.item
	where stockExcel.[Lot #] not in (select IDlot from dbo.lot where IDcompany = 846) /* Scarto quelli già inseriti */
	and qty is not null
	and [Lot #] is not null
	/* Generazione del nuovo lotto da inseirire
	DECLARE @NEW_lotCode nvarchar(20) = @ln_lot
	set @NuovoLotto = @ln_lot
	EXEC sp_generateNewLotCode 845 ,1,'A', @NEW_lotCode OUTPUT
	SELECT @NuovoLotto = @NEW_lotCode */
	/* Inserimento del lotto in anagrafica */
	exec dbo.sp_lotInserimento 846, @ln_lot, @ln_IDitem, @getdate, @datalotto,@lotOriInfo, @lotOri, @lotOriInfo, 0, @note, @step,@stepOrd,
	@DE,@DI,@LA,@LU,@PZ,0,0, '',''
	-- Inserimento lotto in stock e nelle transazioni 
	exec dbo.sp_main_stock_transaction 846, @ln_lot, @idwh, @idloc, @ln_um,'+', @ln_qty, 1, 'boggiani', 'Import da ln', 1
	/* Inserimento valore lotto */
	if (@valLot = 0 ) begin 
		set @valLotU = 0
	end else begin
		set @valLotU = @valLot / @ln_qty
	end
	insert into dbo.lot_value select 846, @ln_lot, @getdate, @valLotU, 'boggiani', 0,''
 
	set @recodDaImportare = @recodDaImportare - 1
end

   /* 2019 12 16, fix per gli step roll USA */
  update [csm].[dbo].[lot]
  set stepRoll = 0
  where IDcompany = 846
  and IDlot_origine not in (select IDlot_origine from [csm].[dbo].[lot] where IDcompany = 846 and IDlot like '%_1')
END;
GO
/****** Object:  StoredProcedure [dbo].[ZZZ_sp_ricevimento_acquisto_20210406]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[ZZZ_sp_ricevimento_acquisto_20210406]
	
	@IDcompany [int],
	@ord_riferimento [nvarchar](100),
	@lot_fornitore [nvarchar](20),
	@lot_data [datetime],
	@lot_val [float],
	@mag [int],
	@loc [int],
	@item [int],
	@DE [float],
	@DI [float],
	@LA [float], 
	@LU [float],
	@PZ [float],	
	@username [nvarchar] (35),
	@um [nvarchar] (5),
	@IDsupplier [int],
	@eur1 [bit]
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
declare @NuovoLotto [nvarchar] (20)
declare @getdate DATETIME = getutcdate()
declare @qty float = 0
declare @lot_val_u float = 0
set @lot_fornitore = UPPER(@lot_fornitore)
/* Generazione codice lotto in base i dati passati (logica di generazione presente sulla vista */
/* AB, 2018 10 29 utilizzo dell'sp che salva i numeri primi
set @NuovoLotto = (select gen_cod_lot.lot_code + gen_cod_lot.IDcountry + gen_cod_lot.IDlotType + gen_cod_lot.year_number + gen_cod_lot.seriale
				   from dbo.vw_GeneraCodiciLottoPerCompany gen_cod_lot
				   inner join dbo.warehouse wh on wh.IDcompany = gen_cod_lot.IDcompany and wh.IDcountry = gen_cod_lot.IDcountry
				   where gen_cod_lot.IDcompany = @IDcompany 
				   and   IDlotType = 'A' 
				   and   wh.IDwarehouse = @mag) */ 
 DECLARE @NEW_lotCode nvarchar(20)
 EXEC sp_generateNewLotCode @IDcompany,@mag,'A', @NEW_lotCode OUTPUT
 SELECT @NuovoLotto = @NEW_lotCode 
/* Inserimento lotto in anagrafica lotti */
exec dbo.sp_lotInserimento @IDcompany, @NuovoLotto, @item, @getdate, @lot_data, @NuovoLotto, @NuovoLotto, @lot_fornitore,  @IDsupplier, '',0,0, @DE,@DI,@LA,@LU,@PZ, 0, 0, @ord_riferimento,'', @eur1
/* Calcolo delle qty in base all'um di gestione magazzino */
set @qty = dbo.calcQtyFromDimensionByUM(@um, @LA,@LU,@PZ,@DI,@DE)
/* Inserimento valore lotto */
if (@lot_val = 0) begin 
	set @lot_val_u = 0
end else begin
	set @lot_val_u = @lot_val / @qty
end
exec dbo.sp_lot_value_add @IDcompany, @NuovoLotto, @lot_val_u, @username, 0, ''
 
-- Inserimento lotto in stock e nelle transazioni 
exec dbo.sp_main_stock_transaction @IDcompany, @NuovoLotto, @mag, @loc, @um,'+', @qty, 1, @username, @ord_riferimento, @IDsupplier, 0
END;
GO
/****** Object:  StoredProcedure [dbo].[ZZZ_spTestImportStock_lndb_sync]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[ZZZ_spTestImportStock_lndb_sync]
AS
BEGIN
--insert into [dbo].[item]
--(
-- IDcompany, chiorino_code, chiorino_desc, branch_code, UM, item_group
--)
--SELECT IDcompany, chiorino_code, chiorino_desc, branch_code, UM, item_group 
--FROM   dbo.vw_anagraficaArticoli_LN 
--where chiorino_code COLLATE DATABASE_DEFAULT not in (select chiorino_code COLLATE DATABASE_DEFAULT from dbo.item where IDcompany = 845)
--and IDcompany = 845
declare @recodDaImportare int = 0
declare @ln_IDitem int = 0
declare @ln_qty float = 0
declare @ln_um nvarchar (3) = ''
declare @ln_lot nvarchar (20) = ''
declare @NuovoLotto nvarchar (20) = ''
declare @getdate DATETIME = getdate()
declare @la float = 0
declare @lu float = 0
declare @pz float = 0
declare @de float = 0
declare @di float = 0
select @recodDaImportare = COUNT(*)
from [ERP-DB02\ERPLN].[erplndb].dbo.twhinr140815 stock
inner join [ERP-DB02\ERPLN].[erplndb].dbo.ttcibd001815 item on stock.t_item = item.t_item
where
	(item.t_item like '         NA%' or  item.t_item like '         CG%' or item.t_item like '         AT%' or item.t_item like '         RV%' ) 
	and item.t_dscb = ''   -- no configurati
	and item.t_kitm <> 3   -- no art. generici
	and stock.t_cwar = 'SCFZ'
while @recodDaImportare <>  0
begin
	select top 1  @ln_IDitem = itemcsm.IDitem, @ln_qty = t_qhnd, @ln_um = t_cuni, @ln_lot = t_clot
	from [ERP-DB02\ERPLN].[erplndb].dbo.twhinr140815 stockln
	inner join [ERP-DB02\ERPLN].[erplndb].dbo.ttcibd001815 item on stockln.t_item = item.t_item
	inner join dbo.item itemcsm  on itemcsm.item COLLATE DATABASE_DEFAULT = ltrim(rtrim(item.t_item)) 
	where
		(item.t_item like '         NA%' or  
		 item.t_item like '         CG%' or 
		 item.t_item like '         AT%' or 
		 item.t_item like '         RV%' or 
		 item.t_item like '         ES%') 
		and item.t_dscb = ''   -- no configurati
		and item.t_kitm <> 3   -- no art. generici
		and stockln.t_cwar = 'SCFZ'
		and stockln.t_clot  COLLATE DATABASE_DEFAULT not in (select IDlot_fornitore from dbo.lot where IDcompany = 845) /* Scarto quelli già inseriti */
	/* Generazione del nuovo lotto da inseirire*/
	DECLARE @NEW_lotCode nvarchar(20)
	EXEC sp_generateNewLotCode 845 ,1,'A', @NEW_lotCode OUTPUT
	SELECT @NuovoLotto = @NEW_lotCode 
	set @la = (select t_valu from [ERP-DB02\ERPLN].[erplndb].dbo.twhltc220815 where t_clot = @ln_lot and t_ltft = 'LA')
	set @lu = (select t_valu from [ERP-DB02\ERPLN].[erplndb].dbo.twhltc220815 where t_clot = @ln_lot and t_ltft = 'LU')
	set @pz = (select t_valu from [ERP-DB02\ERPLN].[erplndb].dbo.twhltc220815 where t_clot = @ln_lot and t_ltft = 'PZ')
	set @de = (select t_valu from [ERP-DB02\ERPLN].[erplndb].dbo.twhltc220815 where t_clot = @ln_lot and t_ltft = 'DE')
	set @di = (select t_valu from [ERP-DB02\ERPLN].[erplndb].dbo.twhltc220815 where t_clot = @ln_lot and t_ltft = 'DI')
	/* Inserimento del lotto in anagrafica */
	exec dbo.sp_lotInserimento 845, @NEW_lotCode, @ln_IDitem, @getdate, @getdate,@NEW_lotCode,@NEW_lotCode,@ln_lot, 0, '', 0,0,
	@DE,@DI,@LA,@LU,@PZ,0,0, '',''
	-- Inserimento lotto in stock e nelle transazioni 
	exec dbo.sp_main_stock_transaction 845, @NuovoLotto, 1, 1, @ln_um,'+', @ln_qty, 1, 'boggiani', 'Import da ln', 1

	set @recodDaImportare = @recodDaImportare - 1
end
END;
GO
/****** Object:  StoredProcedure [dbo].[ZZZZZZ_SYSTEM_sp_delete_lots_specified_on_query]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[ZZZZZZ_SYSTEM_sp_delete_lots_specified_on_query]
AS
SET NOCOUNT ON    -- QUETA OPZIONE è DA METTERE ! LA CHIAMATA PHP POTREBBE FALLIRE SE NO ...  http://php.net/manual/ro/function.sqlsrv-query.php
BEGIN
/* Logica di funzionamento:
2020-09-12
Funzione utilizzata per svutare determinati magazzini sulla base della query espressa.
Abbiamo usato questa SP per svuotare il magazzino di Lille che, inizialmente era stato caricato correttamente
durante l'inventario ma, successivamente, non era più stato manutenuto e quindi, si è reso necessario 
svuotarlo completamente.
PER USARLA: 
1 valorizzare correttamente le prime variabile,
2 sostituire la query che valorizza la var @numer_of_lots_to_be_deleted e, usare poi la stessa query
anche dentro il while
*/
declare @getdate DATETIME = getutcdate()
declare @username nvarchar (35) = 'boggiani'
declare @IDcompany [int] = 845
declare @Lotto [nvarchar] (20) 
declare @mag int
declare @loc int
--La seguente query seleziona tutti i lotti da eliminare
declare @numer_of_lots_to_be_deleted int = isnull((
							  select count(*)
							  from stock s
							  inner join lot l on l.IDcompany = s.IDcompany and s.IDlot = l.IDlot
							  inner join item i on i.IDitem = l.IDitem
							  inner join warehouse w on s.IDcompany = w.IDcompany and s.IDwarehouse = w.IDwarehouse
							  inner join warehouse_location wl on wl.IDcompany = s.IDcompany and wl.IDlocation = s.IDlocation
							  where s.IDcompany = @IDcompany
							  and w.[desc] = 'Lille'
							  and ltrim(rtrim(wl.[desc])) not in
							  ('1 PVC ETA','1 PVC RAK','2 PU ETA','2 PU RAK','3 TEX','4 POLY','5 DIVERS','6 MEZ','7 BUR','SHIPMENT 1','Shipment-2', 'LOAD')) ,0)

while @numer_of_lots_to_be_deleted <>  0
Begin
	set @Lotto = ''
	set @mag = 0
	set @loc = 0
	select top 1 @Lotto = s.IDlot, @mag = s.IDwarehouse, @loc = s.IDlocation
	from stock s
	inner join lot l on l.IDcompany = s.IDcompany and s.IDlot = l.IDlot
	inner join item i on i.IDitem = l.IDitem
	inner join warehouse w on s.IDcompany = w.IDcompany and s.IDwarehouse = w.IDwarehouse
	inner join warehouse_location wl on wl.IDcompany = s.IDcompany and wl.IDlocation = s.IDlocation
	where s.IDcompany = @IDcompany
	and w.[desc] = 'Lille'
	and ltrim(rtrim(wl.[desc])) not in
	('1 PVC ETA','1 PVC RAK','2 PU ETA','2 PU RAK','3 TEX','4 POLY','5 DIVERS','6 MEZ','7 BUR','SHIPMENT 1','Shipment-2', 'LOAD')	
	-- Nella seguente tabella ci sono i tipi di consumi [dbo].[adjustments_type]
	exec [dbo].[sp_adjustments_erase_lots] @IDcompany, @Lotto, @mag, @loc, @username, 3
	set @numer_of_lots_to_be_deleted = @numer_of_lots_to_be_deleted - 1
end
end;
GO
/****** Object:  StoredProcedure [dbo].[ZZZZZZ_SYSTEM_sp_exporToStockOnClearCompany]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[ZZZZZZ_SYSTEM_sp_exporToStockOnClearCompany]
AS
BEGIN

declare @IDcompany int = 846 /* Company che andiamo a portare */
/* !!!!!!******  SOSTITUIRE IL NOME DB DI DESTINAZIONE *******!!!!!!!!!!!!! */

/*
2020-05-28
Questa procedura esporta lo stock da una company presente sul DB da cui viene lanciata, 
e lo importa su un db (stessa company) che DEVE ESSERE PRECEDENTEMENTE PREPARATO\PULITO (vedi note), 
questo processo viene utilizzato per storicizzare la company e ripartire con un ambiente "leggero".
NOTE:
- Attenzione che tipo gli articoli (e i mag\loc) NON possono essere ricaricati, in quanto ci appoggiamo
agli ID
- E' necessario effettuare (SOLO PER LA PRIMA COMPANY CHE IMPORTIAMO) il truncate delle tabelle di "storico" come la transaction ... 
- E necessario\conveniente effettuare la migrazione di tutte le company in un momento solo, in quanto per
esempio la tabella [dbo].[lot_numeri_primi] e necessario "portarsela dietro".
- Questa SP è da lanciare dalla company "sorgente", cioè quella attuale che verrà mantenuta come storico.
PASSI DI SEGUIRE:
1) Backup e ripristico dell'attuale DB di produzione, il vecchio DB lo rinomineremo con CSM_2020 (esempio) quello nuovo CSM.
2) Truncate e o pulizia della tabelle di storico (la tabella [dbo].[lot_numeri_primi] non è da cancellare, SOTTO abbiamo cmq creato una funzione per l'allineamento
da usare solo nel caso di eliminazione),
QUESTO PROCESSO LO SI ESEGUE SOLO PER LA PRIMA COMPANY CHE SI IMPORTA.
truncate table [dbo].[inventory]
truncate table [dbo].[inventory_lots_history]
truncate table [dbo].[adjustments_history]
truncate table dbo.cutting_order
truncate table [dbo].[cutting_order_row]
truncate table [dbo].[material_issue_temp]
truncate table [dbo].[material_transfer_temp]
truncate table dbo.stock
truncate table dbo.transactions
delete from dbo.lot where not in stock e not in lot origine e lot padre
delete from dbo.lot_dimension where not in lot table
*/

declare @recodDaImportare int = 0
declare @Source_IDitem int = 0
declare @dest_IDitem int = 0
declare @Source_qty float = 0
declare @Source_um nvarchar (3) = ''
declare @Source_lot nvarchar (20) = ''
declare @Source_lotOri nvarchar (20) = ''
declare @Source_ord_rif nvarchar (100) = ''
declare @getdate DATETIME = getdate()
declare @Source_datalotto DATETIME = getdate()
declare @valLot float
declare @valLotU float  
declare @Source_lotOriInfo nvarchar (100)
declare @note nvarchar (100)
declare @step int
declare @stepOrd int
declare @la float = 0
declare @lu float = 0
declare @pz float = 0
declare @de float = 0
declare @di float = 0
/* Quelli della company sorgente */
declare @idwh int = 0  
declare @idloc int = 0
declare @idwh_desc nvarchar(100)
declare @idloc_desc nvarchar(100)
/* Quelli della company di destinazione */
declare @idwh_dest int = 0
declare @idloc_dest int = 0
select @recodDaImportare = COUNT(*)
from dbo.stock s
inner join dbo.lot l  on s.IDcompany = l.IDcompany and s.IDlot = l.IDlot
inner join dbo.vw_lotDimensionsPivot ld on ld.IDcompany = s.IDcompany and s.IDlot = ld.IDlot
inner join dbo.item i on l.IDitem = i.IDitem
inner join dbo.vw_lot_last_value lv on lv.IDcompany = s.IDcompany and lv.IDlot = s.IDlot
where s.IDcompany = @IDcompany
declare @TmpTable_stock table(lot_wh_loc nvarchar(220)) /* Tabella che popolo con i record di stock che abbiamo già inserito */
while @recodDaImportare <>  0
begin
	set @Source_lot = ''
	set @Source_IDitem = ''
	set @idwh_desc = ''
	set @idloc_desc = ''
	select top 1  @Source_IDitem = i.IDitem , @Source_qty = s.qty_stock, @Source_um = i.um, @Source_lot = s.IDlot, @Source_lotOri = l.IDlot_origine
	,@la = ld.LA
	,@lu = ld.LU
	,@pz = ld.PZ
	,@de = ld.DE
	,@dI = ld.DI
	,@note = l.note
	,@Source_datalotto = l.date_lot
	,@Source_ord_rif = l.ord_rif
	,@valLot = lv.UnitValue
	,@Source_lotOriInfo = l.IDlot_origine
	,@step = l.stepRoll
	,@stepOrd = l.step_roll_order
	,@idwh = s.IDwarehouse
	,@idloc = s.IDlocation
	,@idwh_desc = w.[desc]
	,@idloc_desc = wl.[desc]
	from dbo.stock s
	inner join dbo.lot l  on s.IDcompany = l.IDcompany and s.IDlot = l.IDlot
	inner join dbo.vw_lotDimensionsPivot ld on ld.IDcompany = s.IDcompany and s.IDlot = ld.IDlot
	inner join dbo.item i on l.IDitem = i.IDitem
	inner join dbo.vw_lot_last_value lv on lv.IDcompany = s.IDcompany and lv.IDlot = s.IDlot
	
	/* La verifica mag\ubi va fatta sulla desc in quanto gli ID sulla altra company possono essere diversi*/
	inner join dbo.warehouse w on w.IDcompany = s.IDcompany and w.IDwarehouse = s.IDwarehouse
	inner join dbo.warehouse_location wl on wl.IDcompany = s.IDcompany and s.IDlocation = wl.IDlocation
	where s.IDcompany = @IDcompany
	/* lotto non ancora inserito nella company\DB di destinazione : (ATTENZIONE hai lotti frazionabili, quindi su più magazzini)*/
	and ltrim(rtrim(s.IDlot +'-'+ w.[desc] +'-'+ wl.[desc])) 
	not in (select ltrim(rtrim(lot_wh_loc)) from @TmpTable_stock)
	/* 2020 06 03, la ricerca sulla comp di dest impiegava troppo tempo, ora utilizziamo la tabella temporanea
	not in (select destStock.IDlot  +'-'+ w_destStock.[desc] +'-'+ wl_destStock.[desc]   
			from csm.dbo.stock destStock 
			inner join csm.dbo.warehouse w_destStock on w.IDcompany = s.IDcompany and w.IDwarehouse = s.IDwarehouse
			inner join csm.dbo.warehouse_location wl_destStock on wl.IDcompany = s.IDcompany and s.IDlocation = wl.IDlocation
			where destStock.IDcompany = @IDcompany)*/ 
	insert into @TmpTable_stock select @Source_lot +'-'+ @idwh_desc +'-'+ @idloc_desc
	/* DA QUI IN POI LE SP VENGONO ESEGUITE SULLA COMPANY DI DESTINAZIONE */
	
	/*Controllo che in anagrafica lotti non sia già stato inserito ()*/
	declare @checkLotExist nvarchar (20) = ''
	set @checkLotExist = isnull((select destLot.IDlot from csm.dbo.lot destLot where destLot.IDcompany = @IDcompany and destLot.IDlot =  @Source_lot),'')

	--Recupero id item dalla company di destinazione (potrebbero essere diversi oppure NON ESISTERE ... verificare prima di effettuare l'import)
	select @dest_IDitem = dItem.IDitem
	from csm.dbo.item dItem where dItem.item = (select item from dbo.item sItem where sItem.IDitem = @Source_IDitem and (sItem.IDcompany = 0 or sItem.IDcompany = @IDcompany))
	/* Inserimento del lotto in anagrafica */
	if (@checkLotExist = '')
	begin
		exec csm.dbo.sp_lotInserimento @IDcompany, @Source_lot, @dest_IDitem, 
		@getdate, @Source_datalotto, @Source_lotOri, @Source_lot, @Source_lotOriInfo, 0, @note, @step,@stepOrd,
		@DE,@DI,@LA,@LU,@PZ,0,0, @Source_ord_rif,'', 0
	end
	--Recupero id magazzino e ubicazione dalla company di destinazione (potrebbero essere diversi oppure NON ESISTERE ... verificare prima di effettuare l'import)
	select @idwh_dest = w_Dest.IDwarehouse 
	from csm.dbo.warehouse w_Dest where w_Dest.IDcompany = @IDcompany and w_Dest.[desc] = 
							(select w.[desc] from dbo.warehouse w where w.IDcompany = @IDcompany and w.IDwarehouse = @idwh)
	select @idloc_dest = l_Dest.IDlocation
	from csm.dbo.warehouse_location l_Dest where l_Dest.IDcompany = @IDcompany and l_Dest.[desc] = 
							(select l.[desc] from warehouse_location l where l.IDcompany = @IDcompany and l.IDlocation = @idloc and l.IDwarehouse = @idwh)
	
	-- Inserimento lotto in stock e nelle transazioni 
	exec csm.dbo.sp_main_stock_transaction @IDcompany, @Source_lot, @idwh_dest, @idloc_dest, @Source_um,'+', @Source_qty, 1, 'boggiani', 'ICT Import', 1, 0
	/* Inserimento valore lotto */
	if (@valLot = 0 ) begin 
		set @valLotU = 0
	end else begin
		set @valLotU = @valLot / @Source_qty
	end
	
	/*Controllo che in anagrafica lotti non sia già stato inserito ()*/
	declare @checkLotValueExist nvarchar (20) = ''
	set @checkLotValueExist = isnull((select destLot.IDlot from csm.dbo.lot_value destLot where destLot.IDcompany = @IDcompany and destLot.IDlot =  @Source_lot),'')
	if (@checkLotValueExist = '')
	begin
		insert into csm.dbo.lot_value select @IDcompany, @Source_lot, @getdate, @valLotU, 'boggiani', 0,'ICT Import'
	end
 
	set @recodDaImportare = @recodDaImportare - 1
end
	-- !!! ADEGUAMENTO NUMERI PRIMI sulla company di destinazione (eliminiamo nel caso ci siano e ricopiamo dalla sorgente)
	delete from csm.dbo.lot_numeri_primi where IDcompany = @IDcompany
	insert into csm.dbo.lot_numeri_primi 
	select * from [dbo].[lot_numeri_primi] where IDcompany = @IDcompany
	
	/* Nella parte sopra abbiamo caricate le informazioni dei lotti a stock, ma non quelli legati dei lotti origine ecc ...,
	qui sotto caricheremo tutte le informazioni di questi lotti: dimensioni, anagrafica lotto, valore. 
	Per fare questo cerchiamo il lotto origine dei lotto a stock e poi selezioniamo l'intera cantena */
	--1) ANAGRAFICA lotti
	insert into csm.dbo.lot
	select * 
	from lot source_lot
	where IDlot_origine in
	(
		select distinct l.IDlot_origine /*Recupero il lotto origine dei lotti a stock per selezionare tutta la catena di lotti */
		from csm.dbo.stock s
		inner join csm.dbo.lot l on s.IDcompany = l.IDcompany and s.IDlot = l.IDlot
		where s.IDcompany = @IDcompany
	)
	and source_lot.IDcompany = @IDcompany
	and source_lot.IDlot not in (select IDlot from csm.dbo.stock) /* Quelli in stock sono già stati inseriti */

	--2) DIMENSIONE lotti
	insert into csm.dbo.lot_dimension
	select source_lot_dimension.* 
	from lot source_lot
	inner join lot_dimension source_lot_dimension on source_lot.IDcompany = source_lot_dimension.IDcompany and source_lot.IDlot = source_lot_dimension.IDlot
	where IDlot_origine in
	(
		select distinct l.IDlot_origine /*Recupero il lotto origine dei lotti a stock per selezionare tutta la catena di lotti */
		from csm.dbo.stock s
		inner join csm.dbo.lot l on s.IDcompany = l.IDcompany and s.IDlot = l.IDlot
		where s.IDcompany = @IDcompany
	)
	and source_lot.IDcompany = @IDcompany
	and source_lot.IDlot not in (select IDlot from csm.dbo.stock) /* Quelli in stock sono già stati inseriti */
	--2) VALORE lotti
	insert into csm.dbo.lot_value
	select source_lot_last_value.IDcompany,  source_lot_last_value.IDlot, source_lot_last_value.date_ins, source_lot_last_value.UnitValue, 'boggiani', 0, 'ICT Import'
	from lot source_lot
	inner join dbo.vw_lot_last_value source_lot_last_value on source_lot_last_value.IDcompany = source_lot.IDcompany and source_lot_last_value.IDlot = source_lot.IDlot	
	where IDlot_origine in
	(
		select distinct l.IDlot_origine /*Recupero il lotto origine dei lotti a stock per selezionare tutta la catena di lotti */
		from csm.dbo.stock s
		inner join csm.dbo.lot l on s.IDcompany = l.IDcompany and s.IDlot = l.IDlot
		where s.IDcompany = @IDcompany
	)
	and source_lot.IDcompany = @IDcompany
	and source_lot.IDlot not in (select IDlot from csm.dbo.stock) /* Quelli in stock sono già stati inseriti */
END;
GO
/****** Object:  StoredProcedure [dbo].[ZZZZZZ_SYSTEM_sp_puliziaTabelleLottiPerTest]    Script Date: 20/09/2023 11:04:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[ZZZZZZ_SYSTEM_sp_puliziaTabelleLottiPerTest] (@IDcompany int )
AS 

  begin
  --truncate table dbo.lot 
  --truncate table dbo.lot_dimension
  --truncate table dbo.transactions
  --truncate table dbo.stock
  --truncate table dbo.cutting_order
  --truncate table [dbo].[cutting_order_row]
  --truncate table [dbo].[material_issue_temp]
  --truncate table [dbo].[material_transfer_temp]
  --truncate table [dbo].[lot_numeri_primi]
  --truncate table [dbo].[users_stock_filter]
  --truncate table [dbo].[zLN_lot_dimension_from_biella]
  --truncate table [dbo].[zLN_lot_value_from_biella]
  --truncate table [dbo].[inventory]
  --truncate table [dbo].[inventory_lots_history]
  --truncate table [dbo].[adjustments_history]
  delete from  dbo.lot where IDcompany = @IDcompany
  delete from  dbo.lot_dimension where IDcompany = @IDcompany
  delete from  dbo.lot_numeri_primi where IDcompany = @IDcompany
  delete from  dbo.lot_value where IDcompany = @IDcompany
  delete from  dbo.transactions where IDcompany = @IDcompany  
  delete from  dbo.cutting_order where IDcompany = @IDcompany
  delete from  dbo.cutting_order_row where IDcompany = @IDcompany
  delete from  dbo.material_issue_temp where IDcompany = @IDcompany
  delete from  dbo.material_transfer_temp where IDcompany = @IDcompany  
  delete from  dbo.inventory where IDcompany = @IDcompany
  delete from  dbo.inventory_lots_history where IDcompany = @IDcompany
  delete from  dbo.adjustments_history where IDcompany = @IDcompany  
  delete from  dbo.shipments where IDcompany = @IDcompany
  delete from  dbo.stock where IDcompany = @IDcompany
  delete from  dbo.devaluation_history where IDcompany = @IDcompany
  delete from  [dbo].[bp]  where IDcompany = @IDcompany
  delete from  [dbo].[bp_destinations]  where IDcompany = @IDcompany
  delete from  [dbo].[item]  where IDcompany = @IDcompany
  delete from  [dbo].[item_enabled]   where IDcompany = @IDcompany
  delete from  [dbo].[item_stock_limits]   where IDcompany = @IDcompany
  
  delete from  [dbo].[order_production]   where IDcompany = @IDcompany
  delete from  [dbo].[order_production_components]   where IDcompany = @IDcompany
    
  delete from  [dbo].[order_split]     where IDcompany = @IDcompany
  delete from  [dbo].[order_split_row]     where IDcompany = @IDcompany
  delete from  [dbo].[receptions]   where IDcompany = @IDcompany

  delete from  [dbo].[warehouse] where IDcompany = @IDcompany
  delete from  [dbo].[warehouse_location] where IDcompany = @IDcompany

  end;
GO

CREATE TRIGGER adjustments_history_custom_id ON adjustments_history
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDadjustments FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'adjustments_history', @id OUTPUT
UPDATE #tmp SET IDadjustments = @id
END
INSERT INTO adjustments_history SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER bp_custom_id ON bp
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDbp FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'bp', @id OUTPUT
UPDATE #tmp SET IDbp = @id
END
INSERT INTO bp SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER bp_destinations_custom_id ON bp_destinations
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDdestination FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'bp_destinations', @id OUTPUT
UPDATE #tmp SET IDdestination = @id
END
INSERT INTO bp_destinations SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER cutting_order_custom_id ON cutting_order
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT id FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'cutting_order', @id OUTPUT
UPDATE #tmp SET id = @id
END
INSERT INTO cutting_order SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER cutting_order_row_custom_id ON cutting_order_row
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDcut FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'cutting_order_row', @id OUTPUT
UPDATE #tmp SET IDcut = @id
END
INSERT INTO cutting_order_row SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER devaluation_history_custom_id ON devaluation_history
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDdevaluation FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'devaluation_history', @id OUTPUT
UPDATE #tmp SET IDdevaluation = @id
END
INSERT INTO devaluation_history SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER inventory_custom_id ON inventory
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDinventory FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'inventory', @id OUTPUT
UPDATE #tmp SET IDinventory = @id
END
INSERT INTO inventory SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER inventory_lots_history_custom_id ON inventory_lots_history
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT id FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'inventory_lots_history', @id OUTPUT
UPDATE #tmp SET id = @id
END
INSERT INTO inventory_lots_history SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER item_custom_id ON item
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDitem FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'item', @id OUTPUT
UPDATE #tmp SET IDitem = @id
END
INSERT INTO item SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER item_enabled_custom_id ON item_enabled
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT id FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'item_enabled', @id OUTPUT
UPDATE #tmp SET id = @id
END
INSERT INTO item_enabled SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER item_group_custom_id ON item_group
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT id FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'item_group', @id OUTPUT
UPDATE #tmp SET id = @id
END
INSERT INTO item_group SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER item_stock_limits_custom_id ON item_stock_limits
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDitemStockLimits FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'item_stock_limits', @id OUTPUT
UPDATE #tmp SET IDitemStockLimits = @id
END
INSERT INTO item_stock_limits SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER logs_custom_id ON logs
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDerr FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'logs', @id OUTPUT
UPDATE #tmp SET IDerr = @id
END
INSERT INTO logs SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER lot_dimension_custom_id ON lot_dimension
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT id FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'lot_dimension', @id OUTPUT
UPDATE #tmp SET id = @id
END
INSERT INTO lot_dimension SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER lot_numeri_primi_custom_id ON lot_numeri_primi
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT id FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'lot_numeri_primi', @id OUTPUT
UPDATE #tmp SET id = @id
END
INSERT INTO lot_numeri_primi SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER lot_tracking_origin_custom_id ON lot_tracking_origin
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDtrack FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'lot_tracking_origin', @id OUTPUT
UPDATE #tmp SET IDtrack = @id
END
INSERT INTO lot_tracking_origin SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER lot_type_custom_id ON lot_type
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT id FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'lot_type', @id OUTPUT
UPDATE #tmp SET id = @id
END
INSERT INTO lot_type SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER lot_value_custom_id ON lot_value
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT id FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'lot_value', @id OUTPUT
UPDATE #tmp SET id = @id
END
INSERT INTO lot_value SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER material_issue_temp_custom_id ON material_issue_temp
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDissue FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'material_issue_temp', @id OUTPUT
UPDATE #tmp SET IDissue = @id
END
INSERT INTO material_issue_temp SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER material_transfer_temp_custom_id ON material_transfer_temp
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDtrans FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'material_transfer_temp', @id OUTPUT
UPDATE #tmp SET IDtrans = @id
END
INSERT INTO material_transfer_temp SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER order_production_custom_id ON order_production
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDord FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'order_production', @id OUTPUT
UPDATE #tmp SET IDord = @id
END
INSERT INTO order_production SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER order_production_components_custom_id ON order_production_components
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDcomp FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'order_production_components', @id OUTPUT
UPDATE #tmp SET IDcomp = @id
END
INSERT INTO order_production_components SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER order_split_custom_id ON order_split
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDord FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'order_split', @id OUTPUT
UPDATE #tmp SET IDord = @id
END
INSERT INTO order_split SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER order_split_row_custom_id ON order_split_row
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDRowSplit FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'order_split_row', @id OUTPUT
UPDATE #tmp SET IDRowSplit = @id
END
INSERT INTO order_split_row SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER receptions_custom_id ON receptions
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDreception FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'receptions', @id OUTPUT
UPDATE #tmp SET IDreception = @id
END
INSERT INTO receptions SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER shipments_custom_id ON shipments
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDshipments FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'shipments', @id OUTPUT
UPDATE #tmp SET IDshipments = @id
END
INSERT INTO shipments SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER stock_custom_id ON stock
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDstock FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'stock', @id OUTPUT
UPDATE #tmp SET IDstock = @id
END
INSERT INTO stock SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER transactions_custom_id ON transactions
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDtransaction FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'transactions', @id OUTPUT
UPDATE #tmp SET IDtransaction = @id
END
INSERT INTO transactions SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;
GO

CREATE TRIGGER warehouse_custom_id ON warehouse
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDwarehouse FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'warehouse', @id OUTPUT
UPDATE #tmp SET IDwarehouse = @id
END
INSERT INTO warehouse SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;

GO
CREATE TRIGGER warehouse_location_custom_id ON warehouse_location
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT IDcompany FROM #tmp)
SET @id = (SELECT IDlocation FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'warehouse_location', @id OUTPUT
UPDATE #tmp SET IDlocation = @id
END
INSERT INTO warehouse_location SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;

GO
CREATE TRIGGER cities_custom_id ON cities
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT company_id FROM #tmp)
SET @id = (SELECT id FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'cities', @id OUTPUT
UPDATE #tmp SET id = @id
END
INSERT INTO cities SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;

GO
CREATE TRIGGER addresses_custom_id ON addresses
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT company_id FROM #tmp)
SET @id = (SELECT id FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'addresses', @id OUTPUT
UPDATE #tmp SET id = @id
END
INSERT INTO addresses SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;

GO
CREATE TRIGGER provinces_custom_id ON provinces
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT company_id FROM #tmp)
SET @id = (SELECT id FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'provinces', @id OUTPUT
UPDATE #tmp SET id = @id
END
INSERT INTO provinces SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;

GO
CREATE TRIGGER zips_custom_id ON zips
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT company_id FROM #tmp)
SET @id = (SELECT id FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'zips', @id OUTPUT
UPDATE #tmp SET id = @id
END
INSERT INTO zips SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;

GO
CREATE TRIGGER contacts_custom_id ON contacts
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT company_id FROM #tmp)
SET @id = (SELECT id FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'contacts', @id OUTPUT
UPDATE #tmp SET id = @id
END
INSERT INTO contacts SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;

GO
CREATE TRIGGER bp_contact_custom_id ON bp_contact
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT company_id FROM #tmp)
SET @id = (SELECT id FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'bp_contact', @id OUTPUT
UPDATE #tmp SET id = @id
END
INSERT INTO bp_contact SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;

GO
CREATE TRIGGER standard_product_custom_id ON standard_products
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT company_id FROM #tmp)
SET @id = (SELECT id FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'standard_products', @id OUTPUT
UPDATE #tmp SET id = @id
END
INSERT INTO standard_products  SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;

GO
CREATE TRIGGER bp_addresses_custom_id ON bp_addresses
INSTEAD OF INSERT
AS
DECLARE @i INT;
DECLARE @n_rows INT;
DECLARE @id NVARCHAR(200) = NULL;
DECLARE @companyId INT = NULL;
BEGIN
SET NOCOUNT ON;
SET @i = 0;
SET @n_rows = (SELECT COUNT(*) FROM inserted);
WHILE(@i < @n_rows)
BEGIN
SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
SET @companyId = (SELECT company_id FROM #tmp)
SET @id = (SELECT id FROM #tmp)
IF @id IS NULL AND @companyId IS NOT NULL
BEGIN
EXEC next_table_id @companyId, N'bp_addresses', @id OUTPUT
UPDATE #tmp SET id = @id
END
INSERT INTO bp_addresses SELECT * FROM #tmp;
DROP TABLE #tmp;
SET @i = @i + 1;
END
END;

GO
CREATE TRIGGER delete_tree ON custom_function_categories INSTEAD OF DELETE AS 	WITH ids as (
select id from deleted
union all
select c.id
from custom_function_categories c
inner join ids i on c.parent_id = i.id
)
DELETE FROM custom_function_categories WHERE id in (select id from ids); 


GO
USE [master]
GO
ALTER DATABASE [test_import] SET  READ_WRITE 