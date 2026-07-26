import React from 'react';

interface LandingViewProps {
  onEnterMarketplace: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onEnterMarketplace }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#fbf8ff] text-[#1a1b22] font-sans">
      <main className="flex-1 pt-4 md:pt-6 pb-24 flex flex-col max-w-xl mx-auto w-full">
        <div className="flex flex-col w-full flex-1">
          {/* Hero Section */}
          <section className="relative px-4 mb-8 mt-2">
            <div className="relative h-[500px] sm:h-[540px] rounded-2xl overflow-hidden flex items-center bg-[#e3e1ec] shadow-lg">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD_e_tqTx0_D8kvJ1y2RnvSDhjpIoiZrlpH-gAMlUQPs-uLHDGDGU7I-jovUbgUplxvVoQ42N6jWXDCmMeXd_rQP5Yuw5FXb98X8-HZlBRMYcFb5XfKcb7AHH1vR7Z0HGUxSkClf-yUeikqzMGf9w_bjlKPO59G1eMnAgRoGf2PPX_lvOCnHNefofIgH8Wu1P08Albj1LR_oh_x0qpOiev5MI70v2WPgVsm6XKYMymOcChau83-RIfQdYsu-O7OOIN43JSRRPF2o_g')`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b22]/90 via-[#1a1b22]/40 to-transparent" />
              <div className="relative z-10 pl-6 pr-6 mt-auto pb-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-[1px] bg-[#d3bbff]"></span>
                  <span className="text-[#d3bbff] font-semibold uppercase tracking-widest text-[11px]">
                    Exclusive Experience
                  </span>
                </div>
                <h1 className="font-serif-source text-white mb-3 leading-tight text-3xl sm:text-4xl font-medium">
                  Malawi's <span className="text-[#d3bbff]">Premium</span>
                  <br />
                  Marketplace
                </h1>
                <p className="text-[#e3e1ec] text-base max-w-[240px] leading-relaxed">
                  Discover quality, trust, and convenience in the heart of Malawi.
                </p>
              </div>
            </div>
          </section>

          {/* Trust Badges */}
          <section className="px-4 mb-12">
            <div className="grid grid-cols-3 gap-2 bg-[#f4f2fd] rounded-xl p-4 border border-[#ccc3d7]/30 shadow-sm">
              <div className="flex flex-col items-center text-center gap-1">
                <span className="material-symbols-outlined text-[#5300b7] text-[20px]">
                  account_balance_wallet
                </span>
                <span className="text-[#1a1b22] text-xs font-medium">5% Commission</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 border-x border-[#ccc3d7]/30">
                <span className="material-symbols-outlined text-[#5300b7] text-[20px]">
                  location_city
                </span>
                <span className="text-[#1a1b22] text-xs font-medium">4 Cities</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <span className="material-symbols-outlined text-[#5300b7] text-[20px]">
                  verified
                </span>
                <span className="text-[#1a1b22] text-xs font-medium">100% Trusted</span>
              </div>
            </div>
          </section>

          {/* Enter Marketplace Action */}
          <section className="px-4 mt-auto pb-12">
            <div className="flex flex-col items-center gap-8">
              <button
                onClick={onEnterMarketplace}
                className="w-full bg-[#5300b7] hover:bg-[#6d28d9] text-white py-5 rounded-full font-semibold text-lg shadow-xl shadow-[#5300b7]/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Enter Marketplace</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>

              <div className="flex flex-col items-center text-center gap-2">
                <p className="text-[#4a4455] text-sm font-semibold">
                  New here? <span className="text-[#5300b7] font-bold">Join 50k+ Malawians</span>
                </p>
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 rounded-full border-2 border-[#fbf8ff] bg-[#e8e7f1] overflow-hidden">
                    <img
                      alt="User"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgQsy4vrovhpndJDvbjGYUQ--LmmDOvPLnaKNimKHc-e25IRDLF5MLPekO7QevMqAnwoEJfzwaURABODtWXybVh7pRWsYto2pIQKlzJCLVyWiBIyFOQaAhYVBB5swAdI7Ur8LKUBfqhkqQmejMQ5iSJ8ab2R-7zO9G9a6peySvoyKBRN81u57tT-hZPr4hYNTDmY6ACkGbes8fSqW7Bi2dJ_e4sNUyF_u6b_sYhnsUY1kj8J6xXlSdrLZGVFLeHkWHvOzdsCx1abQ"
                    />
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#fbf8ff] bg-[#e8e7f1] overflow-hidden">
                    <img
                      alt="User"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMKVMyCJBpAQvLgOjAdakIaGh9JUkdOqVPBtsiYfj-CtVv8jjlWASBV7pCooQ2ilOKBP13zauZERjiBLOH54kpjChqKgk2zWvfZsUM2JgnuTOV8McgWyuoxZvlcqO_9a8p8JwiZbxcphRAXVbz8HHNYNU1KrLsb5e7QhbvK0gfbvbgjbB80P2znGff8WhjCSrwcH3TOJN7JFxyoRisBkG1H7gcOq-_LfNE3_OnWNnl2GYZviEh1bQNCozsP9hgZvG81SawaSoHuvE"
                    />
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#fbf8ff] bg-[#e8e7f1] overflow-hidden">
                    <img
                      alt="User"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPCgmIDUWLf_1PEAehr_-Nq5Q8Qp4_H_Z6Et4wGhfCsDPv0hLQ8kJJlgkm3QFf-Z4fCgchv_9Rq3GWOk0WxD93jtEthEX60fGQ8_OfotmQGf_6STUkMn-YoV6Qsc5uxFUeDBuhx3imK_4GFLyZs0z3pMt_kWkvCJWxUfbC6WmAptICzVkAquXI_ek1GlMvPg2nq8IRsLLJsAn10i4Iye3ANBy0njwtFNSfYtPNPQyEnwIrK7Ds63jYLz9eixTGxYKhBREpN_CW3iA"
                    />
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#fbf8ff] bg-[#5300b7] flex items-center justify-center text-[10px] text-white font-bold">
                    +
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

