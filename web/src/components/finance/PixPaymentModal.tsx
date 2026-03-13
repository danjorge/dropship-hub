import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreatePixPayment, useConfirmPixPayment } from '@/hooks/useFinance';
import QRCode from 'react-qr-code';

interface PixPaymentModalProps {
  onClose: () => void;
}

export function PixPaymentModal({ onClose }: PixPaymentModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'form' | 'qrcode'>('form');
  const [pixPayment, setPixPayment] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    payerName: '',
    payerDocument: '',
  });

  const createPixMutation = useCreatePixPayment();
  const confirmPixMutation = useConfirmPixPayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountCents = Math.round(parseFloat(formData.amount) * 100);
    
    try {
      const result = await createPixMutation.mutateAsync({
        amountCents,
        payerName: formData.payerName,
        payerDocument: formData.payerDocument,
      });
      
      setPixPayment(result);
      setStep('qrcode');
    } catch (error) {
      console.error('Error creating PIX payment:', error);
    }
  };

  const handleConfirmPayment = async () => {
    if (!pixPayment) return;
    
    try {
      await confirmPixMutation.mutateAsync(pixPayment.id);
      alert(t('finance.pixConfirmed'));
      onClose();
    } catch (error) {
      console.error('Error confirming PIX payment:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {step === 'form' ? (
          <>
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{t('finance.addCreditsViaPix')}</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('finance.amount')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('finance.fullName')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.payerName}
                  onChange={(e) => setFormData({ ...formData, payerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="João Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('finance.cpf')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.payerDocument}
                  onChange={(e) => setFormData({ ...formData, payerDocument: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="000.000.000-00"
                  maxLength={11}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createPixMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createPixMutation.isPending ? t('common.loading') : t('finance.generateQRCode')}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{t('finance.pixQRCode')}</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-2">{t('finance.scanQRCode')}</p>
                <div className="bg-white p-4 inline-block rounded-lg">
                  {pixPayment?.qrCodeData && (
                    <QRCode value={pixPayment.qrCodeData} size={200} />
                  )}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">{t('finance.paymentDetails')}</p>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><strong>{t('finance.amount')}:</strong> R$ {pixPayment?.amount?.toFixed(2)}</p>
                  <p><strong>{t('finance.fullName')}:</strong> {pixPayment?.payerName}</p>
                  <p><strong>{t('finance.cpf')}:</strong> {pixPayment?.payerDocument}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>{t('finance.demoMode')}:</strong> {t('finance.demoModeDescription')}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={confirmPixMutation.isPending}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {confirmPixMutation.isPending ? t('common.loading') : t('finance.confirmPayment')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
