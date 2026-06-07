'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart, ComposedChart, ReferenceLine
} from 'recharts';
import { Download, Moon, Sun, ZoomIn, ZoomOut, TrendingUp } from 'lucide-react';

interface DataPoint {
  period: string;
  real: number;
  meta: number;
  variance: number;
  percentage: number;
  mes: string;
}

const PremiumCurvaChart: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  useEffect(() => {
    // Simular carregamento de API
    setTimeout(() => {
      const mockData: DataPoint[] = [
        {
          period: 'Jan/25',
          real: 250,
          meta: 200,
          variance: 50,
          percentage: 25,
          mes: 'Janeiro'
        },
        {
          period: 'Fev/25',
          real: 480,
          meta: 450,
          variance: 30,
          percentage: 6.7,
          mes: 'Fevereiro'
        },
        {
          period: 'Mar/25',
          real: 720,
          meta: 700,
          variance: 20,
          percentage: 2.9,
          mes: 'Março'
        },
        {
          period: 'Abr/25',
          real: 950,
          meta: 950,
          variance: 0,
          percentage: 0,
          mes: 'Abril'
        },
        {
          period: 'Mai/25',
          real: 1100,
          meta: 1200,
          variance: -100,
          percentage: -8.3,
          mes: 'Maio'
        },
        {
          period: 'Jun/25',
          real: 1320,
          meta: 1400,
          variance: -80,
          percentage: -5.7,
          mes: 'Junho'
        },
        {
          period: 'Jul/25',
          real: 1500,
          meta: 1550,
          variance: -50,
          percentage: -3.2,
          mes: 'Julho'
        },
        {
          period: 'Jun/26 (Hoje)',
          real: 1680,
          meta: 1700,
          variance: -20,
          percentage: -1.2,
          mes: 'Junho/26'
        }
      ];
      setData(mockData);
      setLoading(false);
    }, 800);
  }, []);

  const filteredData =
    selectedPeriod === 'all'
      ? data
      : selectedPeriod === '3'
        ? data.slice(-3)
        : data.slice(-6);

  const stats = {
    totalReal: data.reduce((sum, item) => sum + item.real, 0),
    totalMeta: data.reduce((sum, item) => sum + item.meta, 0),
    avgVariance: (
      data.reduce((sum, item) => sum + item.variance, 0) / data.length
    ).toFixed(0),
    successRate: (
      (data.filter((d) => d.real >= d.meta).length / data.length) *
      100
    ).toFixed(1)
  };

  const themeColors = isDarkTheme
    ? {
        bg: '#0f172a',
        card: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#cbd5e1',
        accent: '#3b82f6',
        success: '#10b981',
        danger: '#ef4444',
        border: '#334155'
      }
    : {
        bg: '#ffffff',
        card: '#f8f9fa',
        text: '#1e293b',
        textSecondary: '#64748b',
        accent: '#2563eb',
        success: '#059669',
        danger: '#dc2626',
        border: '#e2e8f0'
      };

  const exportCSV = () => {
    const headers = ['Período', 'Real', 'Meta', 'Variância', 'Percentual'];
    const rows = data.map((d) => [
      d.period,
      d.real.toFixed(2),
      d.meta.toFixed(2),
      d.variance.toFixed(2),
      `${d.percentage.toFixed(1)}%`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `curva-acumulada-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div
        className="w-full h-96 flex items-center justify-center rounded-2xl"
        style={{ backgroundColor: themeColors.card }}
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-transparent animate-spin"
            style={{
              borderTopColor: themeColors.accent,
              borderRightColor: themeColors.accent
            }}
          />
          <p style={{ color: themeColors.textSecondary }}>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full p-6 rounded-2xl transition-all duration-300"
      style={{ backgroundColor: themeColors.bg }}
    >
      {/* Header Premium */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp
              className="w-8 h-8"
              style={{ color: themeColors.accent }}
            />
            <h2 className="text-3xl font-bold" style={{ color: themeColors.text }}>
              CURVA S ACUMULADA
            </h2>
          </div>
          <p style={{ color: themeColors.textSecondary }}>
            Comparativo entre evolução planejada (meta) vs. realidades executadas nos canteiros de obra
          </p>
        </div>

        <button
          onClick={() => setIsDarkTheme(!isDarkTheme)}
          className="p-3 rounded-lg transition-colors"
          style={{
            backgroundColor: themeColors.card,
            color: themeColors.accent,
            border: `1px solid ${themeColors.border}`
          }}
          title="Alternar tema"
        >
          {isDarkTheme ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Controles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Período */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.textSecondary }}
          >
            Período
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border transition-colors"
            style={{
              backgroundColor: themeColors.card,
              color: themeColors.text,
              borderColor: themeColors.border
            }}
          >
            <option value="all">Todos os períodos (8)</option>
            <option value="3">Últimos 3 meses</option>
            <option value="6">Últimos 6 meses</option>
          </select>
        </div>

        {/* Zoom */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.textSecondary }}
          >
            Zoom: {zoomLevel}%
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 20))}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: themeColors.card, color: themeColors.accent }}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="50"
              max="150"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseInt(e.target.value))}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                backgroundColor: themeColors.border,
                accentColor: themeColors.accent
              }}
            />
            <button
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 20))}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: themeColors.card, color: themeColors.accent }}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          <div
            className="px-4 py-3 rounded-lg text-center border"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border
            }}
          >
            <p
              className="text-xs font-medium mb-1"
              style={{ color: themeColors.textSecondary }}
            >
              Total Real
            </p>
            <p
              className="text-xl font-bold"
              style={{ color: themeColors.accent }}
            >
              R$ {(stats.totalReal / 1000).toFixed(1)}K
            </p>
          </div>
          <div
            className="px-4 py-3 rounded-lg text-center border"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border
            }}
          >
            <p
              className="text-xs font-medium mb-1"
              style={{ color: themeColors.textSecondary }}
            >
              Taxa Sucesso
            </p>
            <p
              className="text-xl font-bold"
              style={{ color: themeColors.success }}
            >
              {stats.successRate}%
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico Principal */}
      <div
        className="p-6 rounded-xl mb-8 border"
        style={{
          backgroundColor: themeColors.card,
          borderColor: themeColors.border
        }}
      >
        <h3
          className="font-semibold mb-4"
          style={{ color: themeColors.text }}
        >
          Evolução Acumulada
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
          >
            <defs>
              <linearGradient id="colorRealGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={themeColors.accent}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={themeColors.accent}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={themeColors.border}
              vertical={false}
            />
            <XAxis
              dataKey="period"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: themeColors.textSecondary, fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: themeColors.textSecondary }}
              label={{
                value: 'Valor (R$)',
                angle: -90,
                position: 'insideLeft',
                fill: themeColors.textSecondary
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: themeColors.card,
                border: `2px solid ${themeColors.accent}`,
                borderRadius: '8px',
                color: themeColors.text
              }}
              cursor={{ stroke: themeColors.accent, strokeWidth: 2 }}
              formatter={(value: number) => `R$ ${value.toFixed(0)}`}
            />
            <Legend
              wrapperStyle={{ color: themeColors.text }}
              iconType="line"
            />
            <Area
              type="monotone"
              dataKey="real"
              stroke={themeColors.accent}
              fill="url(#colorRealGradient)"
              name="Real (Executado)"
              isAnimationActive={true}
              animationDuration={1000}
            />
            <Line
              type="monotone"
              dataKey="meta"
              stroke={themeColors.danger}
              strokeDasharray="5 5"
              strokeWidth={2}
              name="Meta (Planejado)"
              dot={{ fill: themeColors.danger, r: 5 }}
              activeDot={{ r: 8 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela Detalhada */}
      <div
        className="rounded-xl border overflow-hidden mb-8"
        style={{
          backgroundColor: themeColors.card,
          borderColor: themeColors.border
        }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                backgroundColor: themeColors.bg,
                borderBottomColor: themeColors.border,
                borderBottomWidth: '1px'
              }}
            >
              <th
                className="px-6 py-4 text-left font-semibold"
                style={{ color: themeColors.textSecondary }}
              >
                Período
              </th>
              <th
                className="px-6 py-4 text-right font-semibold"
                style={{ color: themeColors.textSecondary }}
              >
                Real
              </th>
              <th
                className="px-6 py-4 text-right font-semibold"
                style={{ color: themeColors.textSecondary }}
              >
                Meta
              </th>
              <th
                className="px-6 py-4 text-right font-semibold"
                style={{ color: themeColors.textSecondary }}
              >
                Variância
              </th>
              <th
                className="px-6 py-4 text-center font-semibold"
                style={{ color: themeColors.textSecondary }}
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, idx) => (
              <tr
                key={idx}
                className="transition-colors cursor-pointer"
                style={{
                  backgroundColor:
                    hoveredPoint === idx ? themeColors.bg : 'transparent',
                  borderBottomColor: themeColors.border,
                  borderBottomWidth: '1px'
                }}
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <td
                  className="px-6 py-4"
                  style={{ color: themeColors.text }}
                >
                  <div className="font-medium">{row.period}</div>
                  <div
                    className="text-xs"
                    style={{ color: themeColors.textSecondary }}
                  >
                    {row.mes}
                  </div>
                </td>
                <td
                  className="px-6 py-4 text-right font-semibold"
                  style={{ color: themeColors.accent }}
                >
                  R$ {row.real.toFixed(0)}
                </td>
                <td
                  className="px-6 py-4 text-right"
                  style={{ color: themeColors.textSecondary }}
                >
                  R$ {row.meta.toFixed(0)}
                </td>
                <td
                  className="px-6 py-4 text-right font-medium"
                  style={{
                    color:
                      row.variance >= 0 ? themeColors.success : themeColors.danger
                  }}
                >
                  {row.variance >= 0 ? '+' : ''}R$ {row.variance.toFixed(0)}{' '}
                  <span
                    style={{
                      color: themeColors.textSecondary,
                      fontSize: '0.875rem'
                    }}
                  >
                    ({row.percentage}%)
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold inline-block"
                    style={{
                      backgroundColor:
                        row.real >= row.meta
                          ? `${themeColors.success}20`
                          : `${themeColors.danger}20`,
                      color:
                        row.real >= row.meta
                          ? themeColors.success
                          : themeColors.danger,
                      border: `1px solid ${
                        row.real >= row.meta ? themeColors.success : themeColors.danger
                      }`
                    }}
                  >
                    {row.real >= row.meta ? '✓ OK' : '⚠ Abaixo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer com Info e Botão Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div
          className="flex-1 p-4 rounded-lg border"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border
          }}
        >
          <p
            className="text-sm"
            style={{ color: themeColors.textSecondary }}
          >
            <span style={{ color: themeColors.success }}>●</span> Última
            atualização:{' '}
            <strong>Junho 2026</strong> - Executado está{' '}
            <strong>R$ 280k</strong> acima da curva planejada devido à
            aceleração no canteiro Belle Vue.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
          style={{
            backgroundColor: themeColors.accent,
            color: '#ffffff'
          }}
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>
    </div>
  );
};

export default PremiumCurvaChart;
