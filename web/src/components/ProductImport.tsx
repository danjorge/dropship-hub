import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { catalogApi } from '@/lib/api';
import type { CreateProductRequest } from '@/types';

interface ProductRow {
  // English columns
  title?: string;
  description?: string;
  brand?: string;
  isActive?: boolean;
  
  // Brazilian columns (Portuguese) - Full set
  'ID'?: string;
  'Código'?: string;
  'Descrição'?: string;
  'Unidade'?: string;
  'NCM'?: string;
  'Origem'?: string;
  'Preço'?: string | number;
  'Valor IPI fixo'?: string | number;
  'Observações'?: string;
  'Situação'?: string;
  'Estoque'?: string | number;
  'Preços de custo'?: string | number;
  'Cód no fornecedor'?: string;
  'Fornecedor'?: string;
  'Localização'?: string;
  'Estoque máximo'?: string | number;
  'Estoque mínimo'?: string | number;
  'Peso líquido (Kg)'?: string | number;
  'Peso bruto (Kg)'?: string | number;
  'GTIN/EAN'?: string;
  'GTIN/EAN da embalagem'?: string;
  'Largura do produto'?: string | number;
  'Altura do Produto'?: string | number;
  'Profundidade do produto'?: string | number;
  'Data de validade'?: string;
  'Descrição do Produto no Fornecedor'?: string;
  'Descrição Complementar'?: string;
  'Itens por Caixa'?: string | number;
  'Produto Variação'?: string;
  'Tipo Produção'?: string;
  'Classe de enquadramento do IPI'?: string;
  'Código lista de serviços'?: string;
  'Tipo do item'?: string;
  'Grupo de Tags/Tags'?: string;
  'Tributos'?: string;
  'Código Pai'?: string;
  'Código Integração'?: string;
  'Grupo de produtos'?: string;
  'Marca'?: string;
  'CEST'?: string;
  'Volumes'?: string | number;
  'Descrição Curta'?: string;
  'Cross-Docking'?: string;
  'URL Imagens Externas'?: string;
  'Link Externo'?: string;
  'Meses Garantia Fornecedor'?: string | number;
  'Clonar dados do pai'?: string;
  'Condição do produto'?: string;
  'Frete Grátis'?: string;
  'Número FCI'?: string;
  'Video'?: string;
  'Departamento'?: string;
  'Unidade de medida'?: string;
  'Preço de compra'?: string | number;
  'Valor base ICSM ST para retenção'?: string | number;
  'Valor ICMS ST para retenção'?: string | number;
  'Valor ICMS próprio do substituto'?: string | number;
  'Categoria do produto'?: string;
  'Informações Adicionais'?: string;
}

export function ProductImport({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [progressCount, setProgressCount] = useState<{ current: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    // Template with all Brazilian column names
    const template = [
      { 
        'ID': '',
        'Código': 'PROD001',
        'Descrição': 'Mouse Bluetooth Sem Fio',
        'Unidade': 'UN',
        'NCM': '8471.60.52',
        'Origem': '0',
        'Preço': 89.90,
        'Valor IPI fixo': 0,
        'Observações': '',
        'Situação': 'Ativo',
        'Estoque': 50,
        'Preços de custo': 45.00,
        'Cód no fornecedor': 'FOR-MOUSE-001',
        'Fornecedor': 'TechSupply Ltda',
        'Localização': 'A1-P2',
        'Estoque máximo': 100,
        'Estoque mínimo': 10,
        'Peso líquido (Kg)': 0.15,
        'Peso bruto (Kg)': 0.20,
        'GTIN/EAN': '7891234567890',
        'GTIN/EAN da embalagem': '',
        'Largura do produto': 6,
        'Altura do Produto': 10,
        'Profundidade do produto': 12,
        'Data de validade': '',
        'Descrição do Produto no Fornecedor': 'Mouse Wireless BT 5.0',
        'Descrição Complementar': 'Mouse ergonômico sem fio com conectividade Bluetooth 5.0, 2400 DPI, bateria recarregável',
        'Itens por Caixa': 20,
        'Produto Variação': 'N',
        'Tipo Produção': 'P',
        'Classe de enquadramento do IPI': '',
        'Código lista de serviços': '',
        'Tipo do item': 'Produto',
        'Grupo de Tags/Tags': 'Eletrônicos, Informática',
        'Tributos': '',
        'Código Pai': '',
        'Código Integração': '',
        'Grupo de produtos': 'Periféricos',
        'Marca': 'TechPro',
        'CEST': '',
        'Volumes': 1,
        'Descrição Curta': 'Mouse Bluetooth ergonômico',
        'Cross-Docking': 'N',
        'URL Imagens Externas': '',
        'Link Externo': '',
        'Meses Garantia Fornecedor': 12,
        'Clonar dados do pai': 'N',
        'Condição do produto': 'Novo',
        'Frete Grátis': 'N',
        'Número FCI': '',
        'Video': '',
        'Departamento': 'Informática',
        'Unidade de medida': 'UN',
        'Preço de compra': 45.00,
        'Valor base ICSM ST para retenção': 0,
        'Valor ICMS ST para retenção': 0,
        'Valor ICMS próprio do substituto': 0,
        'Categoria do produto': 'Eletrônicos > Informática > Periféricos',
        'Informações Adicionais': 'Compatível com Windows, Mac e Linux'
      },
      { 
        'ID': '',
        'Código': 'PROD002',
        'Descrição': 'Cabo USB-C 2m',
        'Unidade': 'UN',
        'NCM': '8544.42.00',
        'Origem': '3',
        'Preço': 29.90,
        'Valor IPI fixo': 0,
        'Observações': '',
        'Situação': 'Ativo',
        'Estoque': 200,
        'Preços de custo': 12.00,
        'Cód no fornecedor': 'FOR-CABO-002',
        'Fornecedor': 'CableWorld',
        'Localização': 'B3-P1',
        'Estoque máximo': 500,
        'Estoque mínimo': 50,
        'Peso líquido (Kg)': 0.08,
        'Peso bruto (Kg)': 0.10,
        'GTIN/EAN': '7891234567891',
        'GTIN/EAN da embalagem': '',
        'Largura do produto': 3,
        'Altura do Produto': 15,
        'Profundidade do produto': 3,
        'Data de validade': '',
        'Descrição do Produto no Fornecedor': 'USB-C Cable 2m Fast Charge',
        'Descrição Complementar': 'Cabo de carregamento rápido USB-C, nylon trançado, suporta até 100W',
        'Itens por Caixa': 50,
        'Produto Variação': 'N',
        'Tipo Produção': 'P',
        'Classe de enquadramento do IPI': '',
        'Código lista de serviços': '',
        'Tipo do item': 'Produto',
        'Grupo de Tags/Tags': 'Cabos, Acessórios',
        'Tributos': '',
        'Código Pai': '',
        'Código Integração': '',
        'Grupo de produtos': 'Cabos e Adaptadores',
        'Marca': 'CableMaster',
        'CEST': '',
        'Volumes': 1,
        'Descrição Curta': 'Cabo USB-C carregamento rápido',
        'Cross-Docking': 'N',
        'URL Imagens Externas': '',
        'Link Externo': '',
        'Meses Garantia Fornecedor': 6,
        'Clonar dados do pai': 'N',
        'Condição do produto': 'Novo',
        'Frete Grátis': 'S',
        'Número FCI': '',
        'Video': '',
        'Departamento': 'Acessórios',
        'Unidade de medida': 'UN',
        'Preço de compra': 12.00,
        'Valor base ICSM ST para retenção': 0,
        'Valor ICMS ST para retenção': 0,
        'Valor ICMS próprio do substituto': 0,
        'Categoria do produto': 'Eletrônicos > Acessórios > Cabos',
        'Informações Adicionais': 'Certificado USB-IF'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
    XLSX.writeFile(wb, 'template_importacao_produtos.xlsx');
  };

  const parseCSV = (file: File): Promise<ProductRow[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as ProductRow[]);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  };

  const parseExcel = async (file: File): Promise<ProductRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (!e.target?.result) {
            reject(new Error('Failed to read file'));
            return;
          }
          const data = new Uint8Array(e.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          if (!workbook.SheetNames.length) {
            reject(new Error('Excel file has no sheets'));
            return;
          }
          
          const firstSheetName = workbook.SheetNames[0]!;
          const firstSheet = workbook.Sheets[firstSheetName];
          
          if (!firstSheet) {
            reject(new Error('Failed to read sheet from Excel file'));
            return;
          }
          
          const jsonData = XLSX.utils.sheet_to_json(firstSheet) as ProductRow[];
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProgressMessage(t('products.parsingFile') || 'Parsing file...');
    setProgressCount(null);

    try {
      let products: ProductRow[];

      if (file.name.endsWith('.csv')) {
        products = await parseCSV(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        products = await parseExcel(file);
      } else {
        throw new Error(t('products.invalidFile'));
      }

      setProgressMessage(t('products.importingProducts') || `Importing ${products.length} products...`);
      setProgressCount({ current: 0, total: products.length });

      let successCount = 0;
      const errors: string[] = [];

      // Helper to parse numbers safely
      const parseNumber = (val: any) => {
        if (val === null || val === undefined || val === '') return undefined;
        const num = typeof val === 'string' ? parseFloat(val.replace(',', '.')) : Number(val);
        return isNaN(num) ? undefined : num;
      };

      const parseIntSafe = (val: any) => {
        if (val === null || val === undefined || val === '') return undefined;
        const num = typeof val === 'string' ? Number(val) : val;
        return isNaN(num) ? undefined : Math.floor(num);
      };

      // Process in batches to avoid rate limiting
      const BATCH_SIZE = 100;
      const BATCH_DELAY_MS = 1000; // 1 second delay between batches

      for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const batch = products.slice(i, i + BATCH_SIZE);
        
        // Process batch in parallel
        const batchPromises = batch.map(async (product) => {
          // Map Brazilian columns to English fields for backend
          const title = product.title || product['Descrição'] || product['Código'] || '';
          const description = product.description || product['Descrição Complementar'] || '';
          const brand = product.brand || product['Marca'] || '';
          
          // Map "Situação" (Ativo/Inativo) to isActive boolean
          let isActive = true;
          if (product.isActive !== undefined) {
            isActive = String(product.isActive).toLowerCase() === 'true';
          } else if (product['Situação']) {
            isActive = String(product['Situação']).toLowerCase() === 'ativo';
          }
          
          if (!title || title.trim() === '') {
            errors.push(`Linha ignorada: falta Descrição/Código`);
            return;
          }

          try {
            const productData: CreateProductRequest = {
              title: title.trim(),
              description: description.trim(),
              brand: brand.trim(),
              isActive,
              // All Brazilian product fields
              codigo: product['Código'] || undefined,
                unidade: product['Unidade'] || undefined,
                ncm: product['NCM'] || undefined,
                origem: product['Origem'] || undefined,
                preco: parseNumber(product['Preço']),
                valorIpiFixo: parseNumber(product['Valor IPI fixo']),
                observacoes: product['Observações'] || undefined,
                situacao: product['Situação'] || undefined,
                estoque: parseIntSafe(product['Estoque']),
                precosDeCusto: parseNumber(product['Preços de custo']),
                codNoFornecedor: product['Cód no fornecedor'] || undefined,
                fornecedor: product['Fornecedor'] || undefined,
                localizacao: product['Localização'] || undefined,
                estoqueMaximo: parseIntSafe(product['Estoque máximo']),
                estoqueMinimo: parseIntSafe(product['Estoque mínimo']),
                pesoLiquidoKg: parseNumber(product['Peso líquido (Kg)']),
                pesoBrutoKg: parseNumber(product['Peso bruto (Kg)']),
                gtinEan: product['GTIN/EAN'] || undefined,
                gtinEanDaEmbalagem: product['GTIN/EAN da embalagem'] || undefined,
                larguraDoProduto: parseNumber(product['Largura do produto']),
                alturaDoProduto: parseNumber(product['Altura do Produto']),
                profundidadeDoProduto: parseNumber(product['Profundidade do produto']),
                dataDeValidade: product['Data de validade'] || undefined,
                descricaoDoProdutoNoFornecedor: product['Descrição do Produto no Fornecedor'] || undefined,
                descricaoComplementar: product['Descrição Complementar'] || undefined,
                itensPorCaixa: parseIntSafe(product['Itens por Caixa']),
                produtoVariacao: product['Produto Variação'] || undefined,
                tipoProducao: product['Tipo Produção'] || undefined,
                classeDeEnquadramentoDoIpi: product['Classe de enquadramento do IPI'] || undefined,
                codigoListaDeServicos: product['Código lista de serviços'] || undefined,
                tipoDoItem: product['Tipo do item'] || undefined,
                grupoDeTags: product['Grupo de Tags/Tags'] || undefined,
                tributos: product['Tributos'] || undefined,
                codigoPai: product['Código Pai'] || undefined,
                codigoIntegracao: product['Código Integração'] || undefined,
                grupoDeProdutos: product['Grupo de produtos'] || undefined,
                cest: product['CEST'] || undefined,
                volumes: parseIntSafe(product['Volumes']),
                descricaoCurta: product['Descrição Curta'] || undefined,
                crossDocking: product['Cross-Docking'] || undefined,
                urlImagensExternas: product['URL Imagens Externas'] || undefined,
                linkExterno: product['Link Externo'] || undefined,
                mesesGarantiaFornecedor: parseIntSafe(product['Meses Garantia Fornecedor']),
                clonarDadosDoPai: product['Clonar dados do pai'] || undefined,
                condicaoDoProduto: product['Condição do produto'] || undefined,
                freteGratis: product['Frete Grátis'] || undefined,
                numeroFci: product['Número FCI'] || undefined,
                video: product['Video'] || undefined,
                departamento: product['Departamento'] || undefined,
                unidadeDeMedida: product['Unidade de medida'] || undefined,
                precoDeCompra: parseNumber(product['Preço de compra']),
                valorBaseIcsmStParaRetencao: parseNumber(product['Valor base ICSM ST para retenção']),
                valorIcmsStParaRetencao: parseNumber(product['Valor ICMS ST para retenção']),
                valorIcmsProprioDoSubstituto: parseNumber(product['Valor ICMS próprio do substituto']),
              categoriaDoProduto: product['Categoria do produto'] || undefined,
              informacoesAdicionais: product['Informações Adicionais'] || undefined,
            };

            await catalogApi.createProduct(productData);
            successCount++;
            setProgressCount({ current: successCount, total: products.length });
          } catch (err) {
            const productName = product['Descrição'] || product['Código'] || title;
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            errors.push(`Erro ao criar "${productName}": ${errorMessage}`);
          }
        });

        // Wait for all products in this batch to complete
        await Promise.allSettled(batchPromises);

        // Add delay between batches (except for the last batch)
        if (i + BATCH_SIZE < products.length) {
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
        }
      }

      if (successCount > 0) {
        alert(t('products.importSuccess', { count: successCount }));
        onSuccess();
      }

      if (errors.length > 0) {
        console.error('Import errors:', errors);
        setError(`${errors.length} errors occurred during import. Check console for details.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('products.importError'));
    } finally {
      setIsProcessing(false);
      setProgressMessage('');
      setProgressCount(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('products.importProducts')}</h3>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
          >
            {t('products.exportTemplate')}
          </button>
          <p className="mt-2 text-xs text-gray-500">
            Download a template file to see the required format
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('products.uploadFile')}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          <p className="mt-2 text-xs text-gray-500">
            Supported formats: CSV, Excel (.xlsx, .xls)
          </p>
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <div className="text-sm text-blue-600 font-medium">{progressMessage}</div>
            {progressCount && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{progressCount.current} / {progressCount.total}</span>
                  <span>{Math.round((progressCount.current / progressCount.total) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progressCount.current / progressCount.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
