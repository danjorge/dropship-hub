import { IsString, IsOptional, IsBoolean, IsNumber, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product title',
    example: 'Premium Wireless Headphones',
  })
  @IsString()
  title!: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'High-quality noise-canceling headphones',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Product brand',
    example: 'AudioTech',
  })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({
    description: 'Whether the product is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // Brazilian product fields
  @IsString()
  @IsOptional()
  codigo?: string;

  @IsString()
  @IsOptional()
  unidade?: string;

  @IsString()
  @IsOptional()
  ncm?: string;

  @IsString()
  @IsOptional()
  origem?: string;

  @IsNumber()
  @IsOptional()
  preco?: number;

  @IsNumber()
  @IsOptional()
  valorIpiFixo?: number;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsString()
  @IsOptional()
  situacao?: string;

  @IsInt()
  @IsOptional()
  estoque?: number;

  @IsNumber()
  @IsOptional()
  precosDeCusto?: number;

  @IsString()
  @IsOptional()
  codNoFornecedor?: string;

  @IsString()
  @IsOptional()
  fornecedor?: string;

  @IsString()
  @IsOptional()
  localizacao?: string;

  @IsInt()
  @IsOptional()
  estoqueMaximo?: number;

  @IsInt()
  @IsOptional()
  estoqueMinimo?: number;

  @IsNumber()
  @IsOptional()
  pesoLiquidoKg?: number;

  @IsNumber()
  @IsOptional()
  pesoBrutoKg?: number;

  @IsString()
  @IsOptional()
  gtinEan?: string;

  @IsString()
  @IsOptional()
  gtinEanDaEmbalagem?: string;

  @IsNumber()
  @IsOptional()
  larguraDoProduto?: number;

  @IsNumber()
  @IsOptional()
  alturaDoProduto?: number;

  @IsNumber()
  @IsOptional()
  profundidadeDoProduto?: number;

  @IsString()
  @IsOptional()
  dataDeValidade?: string;

  @IsString()
  @IsOptional()
  descricaoDoProdutoNoFornecedor?: string;

  @IsString()
  @IsOptional()
  descricaoComplementar?: string;

  @IsInt()
  @IsOptional()
  itensPorCaixa?: number;

  @IsString()
  @IsOptional()
  produtoVariacao?: string;

  @IsString()
  @IsOptional()
  tipoProducao?: string;

  @IsString()
  @IsOptional()
  classeDeEnquadramentoDoIpi?: string;

  @IsString()
  @IsOptional()
  codigoListaDeServicos?: string;

  @IsString()
  @IsOptional()
  tipoDoItem?: string;

  @IsString()
  @IsOptional()
  grupoDeTags?: string;

  @IsString()
  @IsOptional()
  tributos?: string;

  @IsString()
  @IsOptional()
  codigoPai?: string;

  @IsString()
  @IsOptional()
  codigoIntegracao?: string;

  @IsString()
  @IsOptional()
  grupoDeProdutos?: string;

  @IsString()
  @IsOptional()
  cest?: string;

  @IsInt()
  @IsOptional()
  volumes?: number;

  @IsString()
  @IsOptional()
  descricaoCurta?: string;

  @IsString()
  @IsOptional()
  crossDocking?: string;

  @IsString()
  @IsOptional()
  urlImagensExternas?: string;

  @IsString()
  @IsOptional()
  linkExterno?: string;

  @IsInt()
  @IsOptional()
  mesesGarantiaFornecedor?: number;

  @IsString()
  @IsOptional()
  clonarDadosDoPai?: string;

  @IsString()
  @IsOptional()
  condicaoDoProduto?: string;

  @IsString()
  @IsOptional()
  freteGratis?: string;

  @IsString()
  @IsOptional()
  numeroFci?: string;

  @IsString()
  @IsOptional()
  video?: string;

  @IsString()
  @IsOptional()
  departamento?: string;

  @IsString()
  @IsOptional()
  unidadeDeMedida?: string;

  @IsNumber()
  @IsOptional()
  precoDeCompra?: number;

  @IsNumber()
  @IsOptional()
  valorBaseIcsmStParaRetencao?: number;

  @IsNumber()
  @IsOptional()
  valorIcmsStParaRetencao?: number;

  @IsNumber()
  @IsOptional()
  valorIcmsProprioDoSubstituto?: number;

  @IsString()
  @IsOptional()
  categoriaDoProduto?: string;

  @IsString()
  @IsOptional()
  informacoesAdicionais?: string;
}
