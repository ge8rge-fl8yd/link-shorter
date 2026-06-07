import React, { useRef } from 'react';

export default function OtpInput({ length = 6, value, onChange }) {
  const inputRefs = useRef([]);

  // Разворачиваем текущую строку в массив нужной длины, заполняя пустотами
  const valuesArray = value.split('').concat(Array(length).fill('')).slice(0, length);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, ''); // Разрешаем только цифры
    if (!val) return;

    const newValueArray = [...valuesArray];
    // Если в ячейке уже что-то было, берем последний введенный символ
    newValueArray[index] = val.slice(-1);
    const updatedValue = newValueArray.join('');
    onChange(updatedValue);

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newValueArray = [...valuesArray];
      
      if (!valuesArray[index] && index > 0) {
        // Если текущая ячейка пустая — стираем предыдущую и фокусимся на ней
        newValueArray[index - 1] = '';
        onChange(newValueArray.join(''));
        inputRefs.current[index - 1]?.focus();
      } else {
        // Иначе просто очищаем текущую ячейку
        newValueArray[index] = '';
        onChange(newValueArray.join(''));
      }
    }
  };

  // Перехват Ctrl+V / Command+V
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Выдергиваем только цифры и режем под максимальную длину (6 символов)
    const digits = pastedData.replace(/\D/g, '').slice(0, length);
    
    if (digits) {
      onChange(digits);
      
      // Вычисляем индекс для фокуса (либо на последнюю цифру, либо в самый конец)
      const targetFocusIndex = Math.min(digits.length, length - 1);
      inputRefs.current[targetFocusIndex]?.focus();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={valuesArray[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste} // Вешаем обработчик на каждую ячейку
          className="flat-input"
          style={{
            width: '45px',
            height: '45px',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            boxSizing: 'border-box'
          }}
        />
      ))}
    </div>
  );
}