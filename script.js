document.addEventListener('DOMContentLoaded', () => {
    const mesoRateInput = document.getElementById('mesoRate');
    const mesoMarketRateInput = document.getElementById('mesoMarketRate');
    const giftRatioInput = document.getElementById('giftRatio');
    const chargeDiscountRateInput = document.getElementById('chargeDiscountRate');

    const calculateBtn = document.getElementById('calculateBtn');

    const basicGiftCostOutput = document.getElementById('basicGiftCost');
    const basicMesoMarketCostOutput = document.getElementById('basicMesoMarketCost');
    const basicConclusionOutput = document.getElementById('basicConclusion');

    const auctionCashPriceInput = document.getElementById('auctionCashPrice');
    const auctionMinSellMesoOutput = document.getElementById('auctionMinSellMeso');
    const auctionMinCostOutput = document.getElementById('auctionMinCost');

    const profitCashPriceInput = document.getElementById('profitCashPrice');
    const profitSellMesoInput = document.getElementById('profitSellMeso');
    const profitResultOutput = document.getElementById('profitResult');
    const profitPer10kResultOutput = document.getElementById('profitPer10kResult');

    // --- 추가된 출력 필드 ID 가져오기 ---
    const costPer10kMPOuput = document.getElementById('costPer10kMP'); // 1만 메포당 비용(현금)
    const costPer1BillionMesoUmguaraeOutput = document.getElementById('costPer1BillionMesoUmguarae'); // 1억 메소당 비용(현금) - 엄거래
    const costPer1BillionMesoMesoMarketOutput = document.getElementById('costPer1BillionMesoMesoMarket'); // 1억 메소당 비용(현금) - 메소마켓
    // --- 추가 끝 ---

    // 입력 필드에 기본값 설정 (페이지 로드 시)
    mesoRateInput.value = 2500;      // 현재 메소 시세 (1억 메소 당 2,500원)
    mesoMarketRateInput.value = 3550; // 메소 마켓 1억 당 3,550 MP
    giftRatioInput.value = 7500;     // 선물식 비율 (1억 메소 당 현금, 7,500원)
    chargeDiscountRateInput.value = 7; // 캐시 충전 할인율 7%

    auctionCashPriceInput.value = 1000; // 캐시 1000원
    profitCashPriceInput.value = 1000;  // 캐시 1000원
    profitSellMesoInput.value = 0.05;   // 판매가 0.05억 메소 (5천만 메소)

    // 모든 입력 필드에 'input' 이벤트 리스너 추가
    // 값이 변경될 때마다 자동으로 계산하도록 설정
    const allInputs = document.querySelectorAll('input[type="number"]');
    allInputs.forEach(input => {
        input.addEventListener('input', calculateMVP);
    });

    // 계산 버튼 클릭 시 계산 함수 호출
    calculateBtn.addEventListener('click', calculateMVP);

    // 초기 로드 시 한 번 계산 실행
    calculateMVP();

    function calculateMVP() {
        // --- 1. 기본 정보 입력 값 가져오기 ---
        const mesoRate = parseFloat(mesoRateInput.value); // 1억 메소 당 현금 (원)
        const mesoMarketRate = parseFloat(mesoMarketRateInput.value); // 메소 마켓 1억 당 메이플포인트 (MP)
        const giftRatioRate = parseFloat(giftRatioInput.value); // 선물식 비율 (1억 메소 당 현금, 원)
        const chargeDiscountRate = parseFloat(chargeDiscountRateInput.value) / 100; // 캐시 충전 할인율 (%)

        // 유효성 검사
        if (isNaN(mesoRate) || mesoRate <= 0 ||
            isNaN(mesoMarketRate) || mesoMarketRate <= 0 ||
            isNaN(giftRatioRate) || giftRatioRate <= 0 ||
            isNaN(chargeDiscountRate) || chargeDiscountRate < 0) {
            basicGiftCostOutput.textContent = '유효하지 않은 입력';
            basicMesoMarketCostOutput.textContent = '유효하지 않은 입력';
            basicConclusionOutput.textContent = '';
            auctionMinSellMesoOutput.textContent = '유효하지 않은 입력';
            auctionMinCostOutput.textContent = '유효하지 않은 입력';
            profitResultOutput.textContent = '유효하지 않은 입력';
            profitPer10kResultOutput.textContent = '유효하지 않은 입력';
            // --- 추가된 출력 필드 초기화 ---
            costPer10kMPOuput.textContent = '유효하지 않은 입력';
            costPer1BillionMesoUmguaraeOutput.textContent = '유효하지 않은 입력';
            costPer1BillionMesoMesoMarketOutput.textContent = '유효하지 않은 입력';
            // --- 추가 끝 ---
            return;
        }

        // --- 2. 기초 MVP작 계산: 선물식과 메소마켓 비교 (기존 로직 유지) ---
        const mpNeededFor10k = 10000; 
        const basicGiftCost = giftRatioRate; 
        basicGiftCostOutput.textContent = `${basicGiftCost.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원`;

        const mesoForMesoMarket = (mpNeededFor10k / mesoMarketRate);
        const basicMesoMarketCost = mesoForMesoMarket * mesoRate;
        basicMesoMarketCostOutput.textContent = `${basicMesoMarketCost.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원`;

        basicConclusionOutput.classList.remove('profit', 'loss');
        if (basicGiftCost < basicMesoMarketCost) {
            basicConclusionOutput.textContent = `선물식으로 ${basicGiftCost.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}:1 (1억 메소 당 ${basicGiftCost.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원) 에 사세요.`;
            basicConclusionOutput.classList.add('profit');
        } else if (basicMesoMarketCost < basicGiftCost) {
            basicConclusionOutput.textContent = `메소마켓으로 ${mesoMarketRate.toLocaleString('ko-KR', { maximumFractionDigits: 0 })} MP에 사세요. (1억 메소 당 ${basicMesoMarketCost.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원)`;
            basicConclusionOutput.classList.add('profit');
        } else {
            basicConclusionOutput.textContent = '선물식과 메소마켓 비용이 동일합니다.';
        }

        // --- 3. 심화 MVP작 : 경매장 최소 판매 비용 (기존 로직 유지) ---
        const auctionCashPrice = parseFloat(auctionCashPriceInput.value); 
        if (isNaN(auctionCashPrice) || auctionCashPrice <= 0) {
            auctionMinSellMesoOutput.textContent = '유효하지 않은 입력';
            auctionMinCostOutput.textContent = '유효하지 않은 입력';
            return;
        }

        const actualCashChargeCost = auctionCashPrice * (1 - chargeDiscountRate);
        const minMesoFor10kCash = (10000 * (1 - chargeDiscountRate)) / mesoRate; 
        const auctionMinSellMesoRaw = minMesoFor10kCash / 0.95; 
        auctionMinSellMesoOutput.textContent = `${(auctionMinSellMesoRaw * 10000).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}만 메소 (${auctionMinSellMesoRaw.toFixed(2)}억)`;
        auctionMinCostOutput.textContent = `${(10000 * (1 - chargeDiscountRate)).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원`;

        // --- 4. 심화 MVP작 : 경매장 판매 손익 (기존 로직 유지) ---
        const profitCashPrice = parseFloat(profitCashPriceInput.value); 
        const profitSellMeso = parseFloat(profitSellMesoInput.value); 

        if (isNaN(profitCashPrice) || profitCashPrice <= 0 ||
            isNaN(profitSellMeso) || profitSellMeso <= 0) {
            profitResultOutput.textContent = '유효하지 않은 입력';
            profitPer10kResultOutput.textContent = '유효하지 않은 입력';
            return;
        }

        const actualCashPaid = profitCashPrice * (1 - chargeDiscountRate);
        const actualMesoReceived = profitSellMeso * 0.95; 
        const valueOfMesoReceived = actualMesoReceived * mesoRate; 

        const profitLoss = valueOfMesoReceived - actualCashPaid;
        profitResultOutput.textContent = `${profitLoss.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원`;

        const profitPer10kActualCash = (profitLoss / profitCashPrice) * 10000;
        profitPer10kResultOutput.textContent = `${profitPer10kActualCash.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원`;

        profitResultOutput.style.color = profitLoss >= 0 ? '#28a745' : '#d9534f';
        profitPer10kResultOutput.style.color = profitPer10kActualCash >= 0 ? '#28a745' : '#d9534f';

        // --- 5. 추가 계산: 1만 메포당 비용(현금) 및 1억 메소당 비용(현금) ---

        // 5-1. 1만 메포당 비용(현금)
        // 메소마켓을 통해 1만 MP를 얻을 때 드는 현금 비용
        // 1만 MP를 얻기 위해 필요한 메소: 10000 MP / (메소마켓 1억 당 MP) = (10000 / mesoMarketRate) 억 메소
        // 그 메소를 현금으로 구매할 때 드는 비용: (10000 / mesoMarketRate) * mesoRate (원)
        const costPer10kMP = (10000 / mesoMarketRate) * mesoRate;
        costPer10kMPOuput.textContent = `${costPer10kMP.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원`;

        // 5-2. 1억 메소당 비용(현금) - 엄거래 (현재 메소 시세)
        // 사용자에게 입력받은 '메소 시세' 자체가 엄거래 1억 메소당 현금 비용입니다.
        const costPer1BillionMesoUmguarae = mesoRate;
        costPer1BillionMesoUmguaraeOutput.textContent = `${costPer1BillionMesoUmguarae.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원`;

        // 5-3. 1억 메소당 비용(현금) - 메소마켓
        // 1억 메소 = mesoMarketRate MP
        // mesoMarketRate MP를 현금으로 환산하려면 (mesoMarketRate MP / 10000 MP) * (1만 MP당 현금 비용)
        // 1억 메소를 메소마켓으로 얻을 때 드는 비용
        // 1억 메소 = mesoMarketRate MP
        // 이 mesoMarketRate MP를 얻기 위해 (10000 MP를 얻는 비용)에 비례해서 현금을 지불해야 함
        // costPer10kMP는 10000 MP를 얻는 비용이므로
        // (mesoMarketRate / 10000) * costPer10kMP
        const costPer1BillionMesoMesoMarket = (mesoMarketRate / 10000) * costPer10kMP;
        costPer1BillionMesoMesoMarketOutput.textContent = `${costPer1BillionMesoMesoMarket.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원`;
    }
});