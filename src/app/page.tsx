"use client"

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Fuel, Car, Plus, Search, Filter, Download, Edit, Trash2, Calendar, DollarSign, BarChart3, Save } from 'lucide-react'

// Tipos de dados
interface AbastecimentoRecord {
  id: string
  data: string
  hora: string
  placa: string
  modelo: string
  motorista: string
  tipoCombustivel: 'Gasolina' | 'Etanol' | 'Diesel' | 'GNV'
  quantidade: number
  precoLitro: number
  precoTotal: number
  quilometragem: number
  observacoes: string
}

interface LavagemRecord {
  id: string
  data: string
  hora: string
  placa: string
  modelo: string
  cliente: string
  tipoLavagem: 'Simples' | 'Completa' | 'Enceramento' | 'Detalhamento'
  preco: number
  status: 'Agendado' | 'Em Andamento' | 'Concluído' | 'Cancelado'
  observacoes: string
}

// Função para formatar data de forma consistente
const formatarData = (dataString: string): string => {
  const [ano, mes, dia] = dataString.split('-')
  return `${dia}/${mes}/${ano}`
}

// Função para formatar números de forma consistente (evita problemas de hidratação)
const formatarNumero = (numero: number): string => {
  return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

export default function PlanilhasVeiculos() {
  // Estados para Abastecimento
  const [abastecimentos, setAbastecimentos] = useState<AbastecimentoRecord[]>([])

  // Estados para Lavagem
  const [lavagens, setLavagens] = useState<LavagemRecord[]>([])

  // Estados dos formulários
  const [novoAbastecimento, setNovoAbastecimento] = useState<Partial<AbastecimentoRecord>>({})
  const [novaLavagem, setNovaLavagem] = useState<Partial<LavagemRecord>>({})
  
  // Estados de filtros
  const [filtroAbastecimento, setFiltroAbastecimento] = useState('')
  const [filtroLavagem, setFiltroLavagem] = useState('')
  
  // Estados de diálogos
  const [dialogAbastecimento, setDialogAbastecimento] = useState(false)
  const [dialogLavagem, setDialogLavagem] = useState(false)

  // Carregar dados do localStorage ao inicializar
  useEffect(() => {
    const abastecimentosSalvos = localStorage.getItem('abastecimentos')
    const lavagensSalvas = localStorage.getItem('lavagens')
    
    if (abastecimentosSalvos) {
      setAbastecimentos(JSON.parse(abastecimentosSalvos))
    }
    
    if (lavagensSalvas) {
      setLavagens(JSON.parse(lavagensSalvas))
    }
  }, [])

  // Salvar dados no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('abastecimentos', JSON.stringify(abastecimentos))
  }, [abastecimentos])

  useEffect(() => {
    localStorage.setItem('lavagens', JSON.stringify(lavagens))
  }, [lavagens])

  // Função para obter data atual no formato YYYY-MM-DD
  const obterDataAtual = (): string => {
    const hoje = new Date()
    return hoje.toISOString().split('T')[0]
  }

  // Função para obter hora atual no formato HH:MM
  const obterHoraAtual = (): string => {
    const agora = new Date()
    return agora.toTimeString().slice(0, 5)
  }

  // Função para exportar dados para arquivo JSON
  const exportarDados = () => {
    const dados = {
      abastecimentos,
      lavagens,
      dataExportacao: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `controle-veiculos-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Função para importar dados de arquivo JSON
  const importarDados = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const dados = JSON.parse(e.target?.result as string)
        if (dados.abastecimentos) {
          setAbastecimentos(dados.abastecimentos)
        }
        if (dados.lavagens) {
          setLavagens(dados.lavagens)
        }
        alert('Dados importados com sucesso!')
      } catch (error) {
        alert('Erro ao importar dados. Verifique se o arquivo está no formato correto.')
      }
    }
    reader.readAsText(file)
  }

  // Função para adicionar abastecimento
  const adicionarAbastecimento = () => {
    if (!novoAbastecimento.placa || !novoAbastecimento.quantidade || !novoAbastecimento.precoLitro) return

    const novoId = Date.now().toString()
    const precoTotal = (novoAbastecimento.quantidade || 0) * (novoAbastecimento.precoLitro || 0)
    
    const registro: AbastecimentoRecord = {
      id: novoId,
      data: novoAbastecimento.data || obterDataAtual(),
      hora: novoAbastecimento.hora || obterHoraAtual(),
      placa: novoAbastecimento.placa || '',
      modelo: novoAbastecimento.modelo || '',
      motorista: novoAbastecimento.motorista || '',
      tipoCombustivel: novoAbastecimento.tipoCombustivel || 'Gasolina',
      quantidade: novoAbastecimento.quantidade || 0,
      precoLitro: novoAbastecimento.precoLitro || 0,
      precoTotal,
      quilometragem: novoAbastecimento.quilometragem || 0,
      observacoes: novoAbastecimento.observacoes || ''
    }

    setAbastecimentos([...abastecimentos, registro])
    setNovoAbastecimento({})
    setDialogAbastecimento(false)
  }

  // Função para adicionar lavagem
  const adicionarLavagem = () => {
    if (!novaLavagem.placa || !novaLavagem.preco) return

    const novoId = Date.now().toString()
    
    const registro: LavagemRecord = {
      id: novoId,
      data: novaLavagem.data || obterDataAtual(),
      hora: novaLavagem.hora || obterHoraAtual(),
      placa: novaLavagem.placa || '',
      modelo: novaLavagem.modelo || '',
      cliente: novaLavagem.cliente || '',
      tipoLavagem: novaLavagem.tipoLavagem || 'Simples',
      preco: novaLavagem.preco || 0,
      status: novaLavagem.status || 'Agendado',
      observacoes: novaLavagem.observacoes || ''
    }

    setLavagens([...lavagens, registro])
    setNovaLavagem({})
    setDialogLavagem(false)
  }

  // Função para remover abastecimento
  const removerAbastecimento = (id: string) => {
    setAbastecimentos(abastecimentos.filter(item => item.id !== id))
  }

  // Função para remover lavagem
  const removerLavagem = (id: string) => {
    setLavagens(lavagens.filter(item => item.id !== id))
  }

  // Filtros
  const abastecimentosFiltrados = useMemo(() => {
    return abastecimentos.filter(item => 
      item.placa.toLowerCase().includes(filtroAbastecimento.toLowerCase()) ||
      item.modelo.toLowerCase().includes(filtroAbastecimento.toLowerCase()) ||
      item.motorista.toLowerCase().includes(filtroAbastecimento.toLowerCase())
    )
  }, [abastecimentos, filtroAbastecimento])

  const lavagensFiltradas = useMemo(() => {
    return lavagens.filter(item => 
      item.placa.toLowerCase().includes(filtroLavagem.toLowerCase()) ||
      item.modelo.toLowerCase().includes(filtroLavagem.toLowerCase()) ||
      item.cliente.toLowerCase().includes(filtroLavagem.toLowerCase())
    )
  }, [lavagens, filtroLavagem])

  // Cálculos de resumo
  const resumoAbastecimento = useMemo(() => {
    const total = abastecimentos.reduce((acc, item) => acc + item.precoTotal, 0)
    const totalLitros = abastecimentos.reduce((acc, item) => acc + item.quantidade, 0)
    const precoMedio = totalLitros > 0 ? total / totalLitros : 0
    
    return { total, totalLitros, precoMedio, registros: abastecimentos.length }
  }, [abastecimentos])

  const resumoLavagem = useMemo(() => {
    const total = lavagens.reduce((acc, item) => acc + item.preco, 0)
    const concluidas = lavagens.filter(item => item.status === 'Concluído').length
    const pendentes = lavagens.filter(item => item.status !== 'Concluído' && item.status !== 'Cancelado').length
    
    return { total, concluidas, pendentes, registros: lavagens.length }
  }, [lavagens])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído': return 'bg-green-100 text-green-800'
      case 'Em Andamento': return 'bg-blue-100 text-blue-800'
      case 'Agendado': return 'bg-yellow-100 text-yellow-800'
      case 'Cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header com Logo */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/d35f4c3e-077a-47b7-8f33-85ad38472c97.png" 
              alt="Milenium Internet Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Controle de Gastos Veicular
          </h1>
          <p className="text-lg text-gray-600">
            Controle completo de gastos com abastecimento e lavagem de veículos
          </p>
          
          {/* Botões de Exportar/Importar */}
          <div className="flex justify-center gap-4 mt-6">
            <Button 
              onClick={exportarDados}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Dados
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={importarDados}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="import-file"
              />
              <Button 
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                asChild
              >
                <label htmlFor="import-file" className="cursor-pointer flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  Importar Dados
                </label>
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="abastecimento" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="abastecimento" className="flex items-center gap-2">
              <Fuel className="w-4 h-4" />
              Abastecimento
            </TabsTrigger>
            <TabsTrigger value="lavagem" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Lavagem
            </TabsTrigger>
          </TabsList>

          {/* Aba Abastecimento */}
          <TabsContent value="abastecimento" className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total de Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-red-600" />
                    <span className="text-2xl font-bold text-red-600">
                      R$ {resumoAbastecimento.total.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Litros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">
                      {resumoAbastecimento.totalLitros.toFixed(1)}L
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Preço Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-600">
                      R$ {resumoAbastecimento.precoMedio.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Registros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span className="text-2xl font-bold text-orange-600">
                      {resumoAbastecimento.registros}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controles */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Fuel className="w-5 h-5" />
                      Controle de Gastos com Abastecimento
                    </CardTitle>
                    <CardDescription>
                      Gerencie todos os gastos com combustível da frota
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Buscar por placa, modelo ou motorista..."
                        value={filtroAbastecimento}
                        onChange={(e) => setFiltroAbastecimento(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>
                    
                    <Dialog open={dialogAbastecimento} onOpenChange={setDialogAbastecimento}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                          <Plus className="w-4 h-4 mr-2" />
                          Novo Abastecimento
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Novo Abastecimento</DialogTitle>
                          <DialogDescription>
                            Registre um novo gasto com abastecimento de veículo
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="data">Data</Label>
                            <Input
                              id="data"
                              type="date"
                              value={novoAbastecimento.data || ''}
                              onChange={(e) => setNovoAbastecimento({...novoAbastecimento, data: e.target.value})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="hora">Hora</Label>
                            <Input
                              id="hora"
                              type="time"
                              value={novoAbastecimento.hora || ''}
                              onChange={(e) => setNovoAbastecimento({...novoAbastecimento, hora: e.target.value})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="placa">Placa *</Label>
                            <Input
                              id="placa"
                              placeholder="ABC-1234"
                              value={novoAbastecimento.placa || ''}
                              onChange={(e) => setNovoAbastecimento({...novoAbastecimento, placa: e.target.value})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="modelo">Modelo</Label>
                            <Input
                              id="modelo"
                              placeholder="Honda Civic"
                              value={novoAbastecimento.modelo || ''}
                              onChange={(e) => setNovoAbastecimento({...novoAbastecimento, modelo: e.target.value})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="motorista">Motorista</Label>
                            <Input
                              id="motorista"
                              placeholder="Nome do motorista"
                              value={novoAbastecimento.motorista || ''}
                              onChange={(e) => setNovoAbastecimento({...novoAbastecimento, motorista: e.target.value})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="tipoCombustivel">Combustível</Label>
                            <Select
                              value={novoAbastecimento.tipoCombustivel || ''}
                              onValueChange={(value) => setNovoAbastecimento({...novoAbastecimento, tipoCombustivel: value as any})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o combustível" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Gasolina">Gasolina</SelectItem>
                                <SelectItem value="Etanol">Etanol</SelectItem>
                                <SelectItem value="Diesel">Diesel</SelectItem>
                                <SelectItem value="GNV">GNV</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="quantidade">Quantidade (L) *</Label>
                            <Input
                              id="quantidade"
                              type="number"
                              step="0.1"
                              placeholder="45.5"
                              value={novoAbastecimento.quantidade || ''}
                              onChange={(e) => setNovoAbastecimento({...novoAbastecimento, quantidade: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="precoLitro">Preço/Litro (R$) *</Label>
                            <Input
                              id="precoLitro"
                              type="number"
                              step="0.01"
                              placeholder="5.89"
                              value={novoAbastecimento.precoLitro || ''}
                              onChange={(e) => setNovoAbastecimento({...novoAbastecimento, precoLitro: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="quilometragem">Quilometragem</Label>
                            <Input
                              id="quilometragem"
                              type="number"
                              placeholder="85420"
                              value={novoAbastecimento.quilometragem || ''}
                              onChange={(e) => setNovoAbastecimento({...novoAbastecimento, quilometragem: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="observacoes">Observações</Label>
                            <Textarea
                              id="observacoes"
                              placeholder="Observações adicionais..."
                              value={novoAbastecimento.observacoes || ''}
                              onChange={(e) => setNovoAbastecimento({...novoAbastecimento, observacoes: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        {novoAbastecimento.quantidade && novoAbastecimento.precoLitro && (
                          <div className="bg-red-50 p-4 rounded-lg">
                            <p className="text-sm text-red-600 font-medium">
                              Total do Gasto: R$ {((novoAbastecimento.quantidade || 0) * (novoAbastecimento.precoLitro || 0)).toFixed(2)}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setDialogAbastecimento(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={adicionarAbastecimento}>
                            Salvar Abastecimento
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium text-gray-600">Data/Hora</th>
                        <th className="text-left p-2 font-medium text-gray-600">Veículo</th>
                        <th className="text-left p-2 font-medium text-gray-600">Motorista</th>
                        <th className="text-left p-2 font-medium text-gray-600">Combustível</th>
                        <th className="text-left p-2 font-medium text-gray-600">Quantidade</th>
                        <th className="text-left p-2 font-medium text-gray-600">Preço/L</th>
                        <th className="text-left p-2 font-medium text-gray-600">Total Gasto</th>
                        <th className="text-left p-2 font-medium text-gray-600">KM</th>
                        <th className="text-left p-2 font-medium text-gray-600">Observações</th>
                        <th className="text-left p-2 font-medium text-gray-600">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {abastecimentosFiltrados.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="text-sm">
                              <div className="font-medium">{formatarData(item.data)}</div>
                              <div className="text-gray-500">{item.hora}</div>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="text-sm">
                              <div className="font-medium">{item.placa}</div>
                              <div className="text-gray-500">{item.modelo}</div>
                            </div>
                          </td>
                          <td className="p-2 text-sm">{item.motorista}</td>
                          <td className="p-2">
                            <Badge variant="outline">{item.tipoCombustivel}</Badge>
                          </td>
                          <td className="p-2 text-sm font-medium">{item.quantidade.toFixed(1)}L</td>
                          <td className="p-2 text-sm">R$ {item.precoLitro.toFixed(2)}</td>
                          <td className="p-2 text-sm font-bold text-red-600">R$ {item.precoTotal.toFixed(2)}</td>
                          <td className="p-2 text-sm">{formatarNumero(item.quilometragem)}</td>
                          <td className="p-2 text-sm text-gray-500 max-w-32 truncate">{item.observacoes}</td>
                          <td className="p-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removerAbastecimento(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Lavagem */}
          <TabsContent value="lavagem" className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total de Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-red-600" />
                    <span className="text-2xl font-bold text-red-600">
                      R$ {resumoLavagem.total.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Concluídas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">
                      {resumoLavagem.concluidas}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span className="text-2xl font-bold text-orange-600">
                      {resumoLavagem.pendentes}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Registros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-600">
                      {resumoLavagem.registros}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controles */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="w-5 h-5" />
                      Controle de Gastos com Lavagem
                    </CardTitle>
                    <CardDescription>
                      Gerencie todos os gastos com serviços de lavagem
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Buscar por placa, modelo ou cliente..."
                        value={filtroLavagem}
                        onChange={(e) => setFiltroLavagem(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>
                    
                    <Dialog open={dialogLavagem} onOpenChange={setDialogLavagem}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                          <Plus className="w-4 h-4 mr-2" />
                          Nova Lavagem
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Nova Lavagem</DialogTitle>
                          <DialogDescription>
                            Registre um novo gasto com serviço de lavagem
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="data-lavagem">Data</Label>
                            <Input
                              id="data-lavagem"
                              type="date"
                              value={novaLavagem.data || ''}
                              onChange={(e) => setNovaLavagem({...novaLavagem, data: e.target.value})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="hora-lavagem">Hora</Label>
                            <Input
                              id="hora-lavagem"
                              type="time"
                              value={novaLavagem.hora || ''}
                              onChange={(e) => setNovaLavagem({...novaLavagem, hora: e.target.value})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="placa-lavagem">Placa *</Label>
                            <Input
                              id="placa-lavagem"
                              placeholder="ABC-1234"
                              value={novaLavagem.placa || ''}
                              onChange={(e) => setNovaLavagem({...novaLavagem, placa: e.target.value})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="modelo-lavagem">Modelo</Label>
                            <Input
                              id="modelo-lavagem"
                              placeholder="Honda Civic"
                              value={novaLavagem.modelo || ''}
                              onChange={(e) => setNovaLavagem({...novaLavagem, modelo: e.target.value})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="cliente">Cliente</Label>
                            <Input
                              id="cliente"
                              placeholder="Nome do cliente"
                              value={novaLavagem.cliente || ''}
                              onChange={(e) => setNovaLavagem({...novaLavagem, cliente: e.target.value})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="tipoLavagem">Tipo de Lavagem</Label>
                            <Select
                              value={novaLavagem.tipoLavagem || ''}
                              onValueChange={(value) => setNovaLavagem({...novaLavagem, tipoLavagem: value as any})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Simples">Simples</SelectItem>
                                <SelectItem value="Completa">Completa</SelectItem>
                                <SelectItem value="Enceramento">Enceramento</SelectItem>
                                <SelectItem value="Detalhamento">Detalhamento</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="preco-lavagem">Preço (R$) *</Label>
                            <Input
                              id="preco-lavagem"
                              type="number"
                              step="0.01"
                              placeholder="25.00"
                              value={novaLavagem.preco || ''}
                              onChange={(e) => setNovaLavagem({...novaLavagem, preco: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                              value={novaLavagem.status || ''}
                              onValueChange={(value) => setNovaLavagem({...novaLavagem, status: value as any})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Agendado">Agendado</SelectItem>
                                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                                <SelectItem value="Concluído">Concluído</SelectItem>
                                <SelectItem value="Cancelado">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="observacoes-lavagem">Observações</Label>
                            <Textarea
                              id="observacoes-lavagem"
                              placeholder="Observações adicionais..."
                              value={novaLavagem.observacoes || ''}
                              onChange={(e) => setNovaLavagem({...novaLavagem, observacoes: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setDialogLavagem(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={adicionarLavagem}>
                            Salvar Lavagem
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium text-gray-600">Data/Hora</th>
                        <th className="text-left p-2 font-medium text-gray-600">Veículo</th>
                        <th className="text-left p-2 font-medium text-gray-600">Cliente</th>
                        <th className="text-left p-2 font-medium text-gray-600">Tipo</th>
                        <th className="text-left p-2 font-medium text-gray-600">Gasto</th>
                        <th className="text-left p-2 font-medium text-gray-600">Status</th>
                        <th className="text-left p-2 font-medium text-gray-600">Observações</th>
                        <th className="text-left p-2 font-medium text-gray-600">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lavagensFiltradas.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="text-sm">
                              <div className="font-medium">{formatarData(item.data)}</div>
                              <div className="text-gray-500">{item.hora}</div>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="text-sm">
                              <div className="font-medium">{item.placa}</div>
                              <div className="text-gray-500">{item.modelo}</div>
                            </div>
                          </td>
                          <td className="p-2 text-sm">{item.cliente}</td>
                          <td className="p-2">
                            <Badge variant="outline">{item.tipoLavagem}</Badge>
                          </td>
                          <td className="p-2 text-sm font-bold text-red-600">R$ {item.preco.toFixed(2)}</td>
                          <td className="p-2">
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </td>
                          <td className="p-2 text-sm text-gray-500 max-w-32 truncate">{item.observacoes}</td>
                          <td className="p-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removerLavagem(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}