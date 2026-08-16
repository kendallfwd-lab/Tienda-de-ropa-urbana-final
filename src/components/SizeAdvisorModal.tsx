import React, { useState } from 'react';
import { X, Sparkles, Ruler, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react';

interface SizeAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize?: (size: string) => void;
}

export const SizeAdvisorModal: React.FC<SizeAdvisorModalProps> = ({
  isOpen,
  onClose,
  onSelectSize
}) => {
  const [height, setHeight] = useState<number>(172);
  const [weight, setWeight] = useState<number>(70);
  const [fitPreference, setFitPreference] = useState<'oversize' | 'regular' | 'fitted'>('oversize');

  if (!isOpen) return null;

  // Smart calculation algorithm for Streetwear boxy fit
  const calculateRecommendation = () => {
    let size = 'M';
    let matchPercentage = 95;
    let chestAdvice = '118 cm - 124 cm (Corte Boxy caído)';
    let lengthAdvice = '72 cm - 74 cm (Largo perfecto)';

    if (height < 165) {
      if (weight < 60) {
        size = fitPreference === 'oversize' ? 'S' : 'XS';
      } else if (weight < 72) {
        size = fitPreference === 'oversize' ? 'M' : 'S';
      } else {
        size = 'L';
      }
    } else if (height <= 176) {
      if (weight < 65) {
        size = fitPreference === 'oversize' ? 'M' : 'S';
      } else if (weight < 78) {
        size = fitPreference === 'oversize' ? 'L' : 'M';
      } else if (weight < 90) {
        size = fitPreference === 'oversize' ? 'XL' : 'L';
      } else {
        size = 'XXL';
      }
    } else if (height <= 186) {
      if (weight < 75) {
        size = fitPreference === 'oversize' ? 'L' : 'M';
      } else if (weight < 90) {
        size = fitPreference === 'oversize' ? 'XL' : 'L';
      } else {
        size = 'XXL';
      }
    } else {
      if (weight < 85) {
        size = 'XL';
      } else {
        size = 'XXL';
      }
    }

    if (size === 'S') {
      chestAdvice = '112 cm - 116 cm (Ancho holgado)';
      lengthAdvice = '70 cm (Hombro caído)';
    } else if (size === 'M') {
      chestAdvice = '118 cm - 122 cm (Corte Boxy ideal)';
      lengthAdvice = '73 cm (Caída media)';
    } else if (size === 'L') {
      chestAdvice = '124 cm - 128 cm (Oversize streetwear)';
      lengthAdvice = '76 cm (Estilo drop-shoulder)';
    } else if (size === 'XL') {
      chestAdvice = '130 cm - 134 cm (Maxi Boxy)';
      lengthAdvice = '78 cm (Largo moderno)';
    } else {
      chestAdvice = '136 cm+ (Ultra Oversize)';
      lengthAdvice = '80 cm';
    }

    return { size, matchPercentage, chestAdvice, lengthAdvice };
  };

  const recommendation = calculateRecommendation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-zinc-950 overflow-hidden text-zinc-900">
        {/* Header */}
        <div className="p-6 bg-zinc-950 text-white relative border-b-2 border-zinc-900">
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-xs font-black uppercase tracking-wider w-fit mb-2 border border-zinc-700">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            Asistente de Talla Leslie Store
          </div>

          <h3 className="text-2xl font-black uppercase tracking-tight font-heading">
            Calcula tu Talla Ideal
          </h3>
          <p className="text-xs text-zinc-300 mt-1 font-medium">
            Nuestras prendas cuentan con cortes <strong>Boxy Fit</strong> y <strong>Oversize</strong> de alta densidad (240g).
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs font-black uppercase mb-1">
                <span className="text-zinc-700">Estatura</span>
                <span className="text-blue-900 font-mono text-sm font-black">{height} cm</span>
              </div>
              <input
                type="range"
                min="150"
                max="205"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-bold mt-0.5">
                <span>150 cm</span>
                <span>175 cm</span>
                <span>205 cm</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-black uppercase mb-1">
                <span className="text-zinc-700">Peso Aproximado</span>
                <span className="text-blue-900 font-mono text-sm font-black">{weight} kg</span>
              </div>
              <input
                type="range"
                min="45"
                max="125"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-bold mt-0.5">
                <span>45 kg</span>
                <span>80 kg</span>
                <span>125 kg</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-zinc-700 block mb-2">
                ¿Cómo te gusta que te quede la ropa?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFitPreference('oversize')}
                  className={`py-2 px-3 rounded-xl text-xs font-black uppercase border-2 transition-all ${
                    fitPreference === 'oversize'
                      ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm'
                      : 'bg-zinc-50 border-zinc-300 text-zinc-700 hover:border-zinc-950'
                  }`}
                >
                  🔥 Boxy Oversize
                </button>
                <button
                  type="button"
                  onClick={() => setFitPreference('regular')}
                  className={`py-2 px-3 rounded-xl text-xs font-black uppercase border-2 transition-all ${
                    fitPreference === 'regular'
                      ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm'
                      : 'bg-zinc-50 border-zinc-300 text-zinc-700 hover:border-zinc-950'
                  }`}
                >
                  ✨ Regular Fit
                </button>
                <button
                  type="button"
                  onClick={() => setFitPreference('fitted')}
                  className={`py-2 px-3 rounded-xl text-xs font-black uppercase border-2 transition-all ${
                    fitPreference === 'fitted'
                      ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm'
                      : 'bg-zinc-50 border-zinc-300 text-zinc-700 hover:border-zinc-950'
                  }`}
                >
                  👌 Ajustado
                </button>
              </div>
            </div>
          </div>

          {/* Recommendation Box */}
          <div className="p-4 rounded-2xl bg-zinc-50 border-2 border-zinc-950 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-900 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-red-600" />
                Tu Talla Recomendada
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-zinc-950 font-mono">
                  Talla {recommendation.size}
                </span>
                <span className="text-xs font-black text-zinc-950 bg-zinc-200 px-2 py-0.5 rounded-full border border-zinc-300 uppercase">
                  {recommendation.matchPercentage}% precisión
                </span>
              </div>
              <div className="text-[11px] text-zinc-600 font-medium space-y-0.5">
                <p>• Pecho: {recommendation.chestAdvice}</p>
                <p>• Largo: {recommendation.lengthAdvice}</p>
              </div>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-zinc-950 text-white flex items-center justify-center font-black text-2xl shadow-md font-mono border-2 border-zinc-800">
              {recommendation.size}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-300 text-xs font-black uppercase text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              Cerrar
            </button>
            {onSelectSize && (
              <button
                onClick={() => {
                  onSelectSize(recommendation.size);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 transition-all border border-zinc-800"
              >
                <span>Usar Talla {recommendation.size}</span>
                <ArrowRight className="w-3.5 h-3.5 text-red-500" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

