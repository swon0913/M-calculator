document.addEventListener('DOMContentLoaded', () => {
    // --- 기본 설정 입력 필드 ---
    const mesoRateInput = document.getElementById('mesoRate');
    const mesoMarketRateInput = document.getElementById('mesoMarketRate');
    const chargeDiscountRateInput = document.getElementById('chargeDiscountRate');
    const auctionFeeRadios = document.querySelectorAll('input[name="auctionFee"]');

    // --- 아이템별 분석 입력 필드 ---
    const itemNameInput = document.getElementById('itemName');
    const cashPriceInput = document.getElementById('cashPrice');
    const mileageAppliedCheckbox = document.getElementById('mileageApplied');
    const auctionMesoPriceInput = document.getElementById('auctionMesoPrice');
    const purchaseCountInput = document.getElementById('purchaseCount');

    const calculateBtn = document.getElementById('calculateBtn');

    // --- 결과 요약 출력 필드 ---
    const totalUsedCashOutput = document.getElementById('totalUsedCash');
    const totalRecoveredMesoOutput = document.getElementById('totalRecoveredMeso');
    const recoveredCashOutput = document.getElementById('recoveredCash');
    const breakevenMesoOutput = document.getElementById('breakevenMeso');
    const profitMarginOutput = document.getElementById('profitMargin');
    const mileageEfficiencyOutput = document.getElementById('mileageEfficiency');
    const overallConclusionOutput = document.getElementById('overallConclusion');

    // --- 추가 정보 (MVP작 일반 효율) 출력 필드 ---
    const costPer10kMPOuput = document.getElementById('costPer10kMP');
    const costPer1BillionMesoUmguaraeOutput = document.getElementById('costPer1BillionMesoUmguarae');
    const costPer1BillionMesoMesoMarketOutput = document.getElementById('costPer1BillionMesoMesoMarket');
    const basicMvpConclusionOutput = document.getElementById('basicMvpConclusion');


    // --- 입력 필드에 초기값 설정 및 유효성 검사 (HTML value 속성과 연동) ---
    // HTML에 value 속성이 있으므로, DOMContentLoaded 시점에 그 값을 바로 사용하고,
    // input 이벤트 리스너를 통해 값이 변경될 때마다 계산하도록 합니다.
    // 여기서는 별도로 JavaScript에서 기본값을 강제로 설정할 필요는 없습니다.
    // 다만, 필수 입력값이 비어있을 때 `placeholder`만 있다면 초기 계산이 안 될 수 있으니
    // HTML의 `value` 속성이 비어있지 않은지 확인해주세요.


    // --- 이벤트 리스너 설정 ---
    // 모든 관련 입력 필드에 'input' 이벤트 리스너 추가하여 값이 변경될 때마다 자동 계산
    const allNumericTextInputs = document.querySelectorAll(
        '#mesoRate, #mesoMarketRate, #chargeDiscountRate, ' +
        '#itemName, #cashPrice, #auctionMesoPrice, #purchaseCount'
    );
    allNumericTextInputs.forEach(input => {
        input.addEventListener('input', calculateMVP);
    });

    // 라디오 버튼 (경매장 수수료) 변경 시 계산
    auctionFeeRadios.forEach(radio => {
        radio.addEventListener('change', calculateMVP);
    });

    // 체크박스 (마일리지 적용 여부) 변경 시 계산
    mileageAppliedCheckbox.addEventListener('change', calculateMVP);

    // 계산 버튼 클릭 시 계산 함수 호출 (주로 수동 계산을 원하는 경우)
    calculateBtn.addEventListener('click', calculateMVP);

    // 페이지 로드 완료 시 초기 계산 실행
    // 이 부분이 가장 중요합니다. DOMContentLoaded 시점에 한 번 호출하여 초기값을 반영합니다.
    calculateMVP();

    // --- 메인 계산 함수 ---
    function calculateMVP() {
        // 1. 기본 설정 값 가져오기 (전역적으로 사용)
        const mesoRate = parseFloat(mesoRateInput.value); // 1억 메소 당 현금 (원)
        const mesoMarketRate = parseFloat(mesoMarketRateInput.value); // 메소 마켓 1억 당 메이플포인트 (MP)
        const chargeDiscountRate = parseFloat(chargeDiscountRateInput.value) / 100; // 캐시 충전 할인율 (%)

        let auctionFeeRate = 0.05; // 기본 5%
        auctionFeeRadios.forEach(radio => {
            if (radio.checked) {
                auctionFeeRate = parseFloat(radio.value);
            }
        });

        // 2. 아이템별 분석 입력 값 가져오기
        const itemName = itemNameInput.value; // 아이템명 (문자열)
        const cashPrice = parseFloat(cashPriceInput.value); // 아이템 1개당 캐시 가격
        const mileageApplied = mileageAppliedCheckbox.checked; // 마일리지 적용 여부 (boolean)
        const auctionMesoPrice = parseFloat(auctionMesoPriceInput.value); // 아이템 1개당 경매장 판매 메소 (억)
        const purchaseCount = parseInt(purchaseCountInput.value); // 구입 개수

        // --- 유효성 검사 ---
        // 모든 숫자 입력 필드가 유효하고 양수여야 합니다. 할인율은 0 이상 1 미만.
        if (isNaN(mesoRate) || mesoRate <= 0 ||
            isNaN(mesoMarketRate) || mesoMarketRate <= 0 ||
            isNaN(chargeDiscountRate) || chargeDiscountRate < 0 || chargeDiscountRate >= 1 ||
            isNaN(cashPrice) || cashPrice <= 0 ||
            isNaN(auctionMesoPrice) || auctionMesoPrice < 0 || // 판매 메소 가격은 0일 수도 있으므로 >= 0
            isNaN(purchaseCount) || purchaseCount <= 0 ||
            itemName.trim() === '' // 아이템 이름이 비어있지 않아야 함
        ) {
            // 모든 출력 필드 초기화 및 오류 메시지 표시
            resetOutputs('유효하지 않은 입력 또는 필수 정보 누락');
            return;
        }

        // --- 아이템별 MVP작 계산 ---

        // 2-1. 총 사용 캐시 (할인 및 마일리지 적용)
        let actualCashPricePerItem = cashPrice; // 아이템 1개당 현금 구매가 (할인 적용 전)
        let mileageDiscountPerItem = 0; // 아이템 1개당 마일리지 절감액 (현금 가치)

        if (mileageApplied) {
            // 마일리지 사용 시 캐시 가격의 30%를 마일리지로 처리 (예시)
            mileageDiscountPerItem = cashPrice * 0.30;
            actualCashPricePerItem = cashPrice - mileageDiscountPerItem; // 마일리지로 처리된 금액만큼 현금 지불 감소
        }
        
        // 최종 현금 지불 금액 (할인율 적용)
        const cashSpentPerItemAfterDiscount = actualCashPricePerItem * (1 - chargeDiscountRate);
        const totalCashSpent = cashSpentPerItemAfterDiscount * purchaseCount;
        totalUsedCashOutput.textContent = `${totalCashSpent.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원`;

        // 2-2. 총 회수 메소 (수수료 적용)
        const totalRecoveredMeso = (auctionMesoPrice * (1 - auctionFeeRate)) * purchaseCount;
        totalRecoveredMesoOutput.textContent = `${totalRecoveredMeso.toFixed(2)}억 메소`;

        // 2-3. 회수 금액 (현금)
        const recoveredCash = totalRecoveredMeso * mesoRate;
        recoveredCashOutput.textContent = `${recoveredCash.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원`;

        // 2-4. 본전 가격 (아이템 1개당 필요 메소)
        // 아이템 1개당 현금으로 지불한 실제 금액 (할인 및 마일리지 적용 후)
        // 이 금액을 회수하기 위해 수수료를 제외하고 필요한 메소
        const breakevenMesoPerItem = (cashSpentPerItemAfterDiscount / mesoRate) / (1 - auctionFeeRate);
        breakevenMesoOutput.textContent = `${breakevenMesoPerItem.toFixed(2)}억 메소`;

        // 2-5. 이익률 (회수 금액 / 사용 캐시)
        let profitMargin = 0;
        if (totalCashSpent > 0) { // 0으로 나누는 것 방지
            profitMargin = (recoveredCash / totalCashSpent) * 100;
        }
        profitMarginOutput.textContent = `${profitMargin.toFixed(2)}%`;

        // 2-6. 마일리지 효율 (절감액)
        const totalMileageEfficiency = mileageDiscountPerItem * purchaseCount;
        mileageEfficiencyOutput.textContent = `${totalMileageEfficiency.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원`;

        // 2-7. 전체 결론
        overallConclusionOutput.classList.remove('profit', 'loss');
        if (recoveredCash >= totalCashSpent) {
            overallConclusionOutput.textContent = `축하합니다! ${itemName} ${purchaseCount}개 판매로 ${Math.abs(recoveredCash - totalCashSpent).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원 이득을 보셨습니다.`;
            overallConclusionOutput.classList.add('profit');
        } else {
            overallConclusionOutput.textContent = `아쉽지만 ${itemName} ${purchaseCount}개 판매로 ${Math.abs(recoveredCash - totalCashSpent).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원 손해를 보셨습니다.`;
            overallConclusionOutput.classList.add('loss');
        }


        // --- 추가 정보 (MVP작 일반 효율) 계산 ---
        const mpNeededFor10k = 10000;

        // 1만 메포당 비용(현금)
        const costPer10kMP = (mpNeededFor10k / mesoMarketRate) * mesoRate;
        costPer10kMPOuput.textContent = `${costPer10kMP.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원`;

        // 1억 메소당 비용(현금) - 엄거래
        const costPer1BillionMesoUmguarae = mesoRate;
        costPer1BillionMesoUmguaraeOutput.textContent = `${costPer1BillionMesoUmguarae.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원`;

        // 1억 메소당 비용(현금) - 메소마켓
        // 1억 메소 = mesoMarketRate (MP)에 해당
        // 이 mesoMarketRate (MP)를 현금으로 환산하는 비용
        // = (mesoMarketRate MP / 10000 MP) * (1만 메포당 비용)
        const costPer1BillionMesoMesoMarket = (mesoMarketRate / mpNeededFor10k) * costPer10kMP;
        costPer1BillionMesoMesoMarketOutput.textContent = `${costPer1BillionMesoMesoMarket.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원`;

        // 기본 MVP 효율 결론
        basicMvpConclusionOutput.classList.remove('profit', 'loss');
        if (costPer1BillionMesoUmguarae < costPer1BillionMesoMesoMarket) {
            basicMvpConclusionOutput.textContent = `엄거래가 메소마켓보다 효율적입니다. (1억 메소 당 ${costPer1BillionMesoUmguarae.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원)`;
            basicMvpConclusionOutput.classList.add('profit');
        } else if (costPer1BillionMesoMesoMarket < costPer1BillionMesoUmguarae) {
            basicMvpConclusionOutput.textContent = `메소마켓이 엄거래보다 효율적입니다. (1억 메소 당 ${costPer1BillionMesoMesoMarket.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원)`;
            basicMvpConclusionOutput.classList.add('profit');
        } else {
            basicMvpConclusionOutput.textContent = '엄거래와 메소마켓 비용이 동일합니다.';
        }
    }

    // --- 유효성 검사 실패 시 출력 필드 초기화 함수 ---
    function resetOutputs(message) {
        totalUsedCashOutput.textContent = message;
        totalRecoveredMesoOutput.textContent = message;
        recoveredCashOutput.textContent = message;
        breakevenMesoOutput.textContent = message;
        profitMarginOutput.textContent = message;
        mileageEfficiencyOutput.textContent = message;
        overallConclusionOutput.textContent = '';
        costPer10kMPOuput.textContent = message;
        costPer1BillionMesoUmguaraeOutput.textContent = message;
        costPer1BillionMesoMesoMarketOutput.textContent = message;
        basicMvpConclusionOutput.textContent = '';
        overallConclusionOutput.classList.remove('profit', 'loss');
        basicMvpConclusionOutput.classList.remove('profit', 'loss');
    }
});