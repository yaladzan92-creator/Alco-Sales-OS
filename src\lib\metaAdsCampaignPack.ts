function pickSelectedById<T extends { id?: string }>(items: T[] | undefined, id?: string | null) {
  if (!Array.isArray(items) || !id) return null;
  return items.find((item) => item?.id === id) || null;
}

function createImplementationChecklist(project: any, pack: any) {
  const brandName = pack?.brand?.brandName || project?.name || "Brand";
  const imageReady = Array.isArray(pack?.deliverables?.singleImageAngles) && pack.deliverables.singleImageAngles.length > 0;
  const carouselReady = Array.isArray(pack?.deliverables?.carouselOptions) && pack.deliverables.carouselOptions.length > 0;
  const videoReady = Array.isArray(pack?.deliverables?.videoScripts) && pack.deliverables.videoScripts.length > 0;

  return [
    `Buat campaign Meta Ads baru untuk ${brandName}.`,
    `Pilih objective yang paling sesuai dengan penawaran utama dan tujuan konversi.`,
    `Masukkan primary text, headline, dan CTA dari output angle yang dipilih.`,
    imageReady ? `Upload aset visual single image berdasarkan prompt dan composition guide yang sudah dibuat.` : `Generate dulu aset single image jika ingin menjalankan iklan gambar statis.`,
    carouselReady ? `Jika memakai carousel, susun slide sesuai urutan storytelling yang direkomendasikan.` : `Generate dulu carousel jika ingin format multi-slide.`,
    videoReady ? `Jika memakai video, produksi video berdasarkan script, pacing, dan storyboard prompt yang dipilih.` : `Generate dulu video script jika ingin format reels atau video ads.`,
    `Pasang UTM, pixel, dan event tracking sebelum campaign diaktifkan.`,
    `Review policy claims, tone, dan kesesuaian brand sebelum publish final di Ads Manager.`
  ];
}

export function buildMetaAdsCampaignPack(project: any) {
  const singleImageAngles = Array.isArray(project?.adsGeneratedAngles) ? project.adsGeneratedAngles : [];
  const carouselOptions = Array.isArray(project?.adsInputState?.generatedCarousel) ? project.adsInputState.generatedCarousel : [];
  const videoScripts = Array.isArray(project?.adsInputState?.generatedVideoDirections) ? project.adsInputState.generatedVideoDirections : [];

  const selectedSingleImageAngle = pickSelectedById(singleImageAngles, project?.adsInputState?.imageTargetAngle || project?.selectedAngle);
  const selectedCarousel = pickSelectedById(carouselOptions, project?.adsInputState?.selectedCarouselOption);
  const selectedVideoScript = pickSelectedById(videoScripts, project?.adsInputState?.selectedVideoOption);

  const pack = {
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    project: {
      id: project?.id || null,
      name: project?.name || "Untitled Project"
    },
    focus: {
      channel: "Meta Ads",
      audienceType: "Digital marketer pemula penjual produk digital",
      useCase: "Campaign pack siap pakai untuk menyiapkan iklan Meta Ads end-to-end"
    },
    strategySummary: {
      niche: project?.sharedBusinessContext?.product?.niche || null,
      audience: project?.sharedBusinessContext?.audience?.primary || null,
      mainPain: project?.sharedBusinessContext?.problem?.mainPain || null,
      positioning: project?.sharedBusinessContext?.strategy?.positioning || null,
      usp: project?.sharedBusinessContext?.strategy?.usp || null,
      offer: project?.sharedBusinessContext?.strategy?.offer || null,
      marketingAngle: project?.sharedBusinessContext?.strategy?.marketingAngle || null,
      copyDirection: project?.sharedBusinessContext?.campaign?.copyDirection || null
    },
    brand: {
      brandName: project?.sharedBusinessContext?.branding?.brandName || project?.brandFoundationData?.brandName || project?.name || null,
      tagline: project?.sharedBusinessContext?.branding?.tagline || project?.brandFoundationData?.tagline || null,
      mission: project?.sharedBusinessContext?.branding?.mission || project?.brandFoundationData?.mission || null,
      tone: project?.sharedBusinessContext?.branding?.tone || null
    },
    campaignSettings: {
      platform: project?.adsInputState?.platform || null,
      imageFormat: project?.adsInputState?.imageFormat || null,
      emotionalFlow: project?.adsInputState?.customEmotionalFlow || project?.adsInputState?.emotionalFlow || null,
      visualHookFocus: project?.adsInputState?.visualHookFocus || null,
      styleDirection: project?.adsInputState?.styleDirection || [],
      colorStrategy: project?.adsInputState?.colorStrategy || null,
      textDensity: project?.adsInputState?.textDensity || null,
      ctaStyle: project?.adsInputState?.ctaStyle || null,
      additionalRequest: project?.adsInputState?.additionalRequest || null
    },
    deliverables: {
      singleImageAngles,
      selectedSingleImageAngle,
      carouselOptions,
      selectedCarousel,
      videoScripts,
      selectedVideoScript
    },
    validation: {
      hasStrategyCore: !!project?.summaryData,
      hasBrandFoundation: !!project?.brandFoundationData,
      hasSingleImageOutput: singleImageAngles.length > 0,
      hasCarouselOutput: carouselOptions.length > 0,
      hasVideoOutput: videoScripts.length > 0,
      landingPageReady: !!project?.landingPageData
    }
  };

  return {
    ...pack,
    implementationChecklist: createImplementationChecklist(project, pack)
  };
}

export function downloadMetaAdsCampaignPack(project: any) {
  const pack = buildMetaAdsCampaignPack(project);
  const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json;charset=utf-8" });
  const safeName = (project?.name || "meta-ads-campaign-pack").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return {
    fileName: `${safeName}-meta-ads-campaign-pack.json`,
    blob,
    pack
  };
}
