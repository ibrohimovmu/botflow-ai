"""
utils/shadow_sync.py
Film DB ni Hugging Face Dataset'ga har 5 daqiqada zaxiralash.
Server qayta ishga tushganda oxirgi bazani orqaga tortadi.
"""
import asyncio
import os
import shutil
import logging

logger = logging.getLogger(__name__)

DB_PATH = "data/film.db"
REPO_ID = os.getenv("HF_DATASET", "ibrohmwvgmai/filmflow-data")
HF_TOKEN = os.getenv("HF_TOKEN", "")


class ShadowSync:
    def __init__(self):
        self._api = None

    def _get_api(self):
        if not HF_TOKEN:
            return None
        if self._api is None:
            from huggingface_hub import HfApi
            self._api = HfApi(token=HF_TOKEN)
            try:
                self._api.create_repo(repo_id=REPO_ID, repo_type="dataset", private=True, exist_ok=True)
            except Exception:
                pass
        return self._api

    async def restore(self):
        """Serverda baza yo'q bo'lsa HF'dan yuklab olish."""
        api = self._get_api()
        if not api:
            return
        try:
            logger.info("[SYNC] HF'dan bazani yuklab olinmoqda...")
            path = await asyncio.to_thread(
                api.hf_hub_download,
                repo_id=REPO_ID,
                filename="data/film.db",
                repo_type="dataset"
            )
            os.makedirs("data", exist_ok=True)
            shutil.copy(path, DB_PATH)
            logger.info("[SYNC] ✅ Baza restored!")
        except Exception as e:
            logger.warning(f"[SYNC] Restore skip: {e}")

    async def backup(self):
        """Bazani HF'ga yuklash."""
        api = self._get_api()
        if not api or not os.path.exists(DB_PATH):
            return
        try:
            await asyncio.to_thread(
                api.upload_file,
                path_or_fileobj=DB_PATH,
                path_in_repo="data/film.db",
                repo_id=REPO_ID,
                repo_type="dataset"
            )
            logger.info("[SYNC] ✅ Backup yuklandi")
        except Exception as e:
            logger.warning(f"[SYNC] Backup fail: {e}")

    async def run_scheduler(self, interval: int = 300):
        """Har N soniyada zaxira yuklaydi."""
        while True:
            await asyncio.sleep(interval)
            await self.backup()


sync = ShadowSync()
