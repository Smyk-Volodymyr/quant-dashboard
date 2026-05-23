"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { playTerminalSound } from "@/lib/audio";

export interface Trade {
  id: string;
  user_id: string; 
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entry_price: number;
  exit_price: number;
  pnl_usdt: number;
  pnl_percent: number;
  entry_time: string;
  exit_time: string;
  close_reason: string | null;
  obi: number;
}

export function useTradeStream() {
  const [filterSymbol, setFilterSymbol] = useState<string>('ALL');
  const [filterProfit, setFilterProfit] = useState<'ALL' | 'PROFIT' | 'LOSS'>('ALL');
  
  const [trades, setTrades] = useState<Trade[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const pageSize = 50;
  const supabase = createClient();

  useEffect(() => {
    setTrades([]);
    setPage(1);
    setHasMore(true);
    setIsLoading(true);
  }, [filterSymbol, filterProfit]);

  useEffect(() => {
    let isMounted = true;

    async function fetchTrades() {
      if (page > 1) setIsFetchingNextPage(true);
      
      try {
        let query = supabase
          .from("trades")
          .select("*", { count: "exact" })
          .order("exit_time", { ascending: false });

        if (filterSymbol !== 'ALL') query = query.eq('symbol', filterSymbol);
        if (filterProfit === 'PROFIT') query = query.gt('pnl_usdt', 0);
        else if (filterProfit === 'LOSS') query = query.lte('pnl_usdt', 0);

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;

        if (error) throw error;

        if (isMounted) {
          const fetchedTrades = data as Trade[] || [];
          
          setTrades(prev => page === 1 ? fetchedTrades : [...prev, ...fetchedTrades]);
          if (count !== null) setTotalCount(count);
          setHasMore(fetchedTrades.length === pageSize);
        }
      } catch (err) {
        console.error("Помилка завантаження угод:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsFetchingNextPage(false);
        }
      }
    }

    fetchTrades();

    return () => { isMounted = false; };
  }, [page, filterSymbol, filterProfit]);

  const loadMore = useCallback(() => {
    if (!isFetchingNextPage && hasMore) {
      setPage(p => p + 1);
    }
  }, [isFetchingNextPage, hasMore]);

  useEffect(() => {
    const channelName = `trades_channel_${crypto.randomUUID()}`;
    const channel = supabase.channel(channelName);

    channel.on(
      "postgres_changes", 
      { event: "INSERT", schema: "public", table: "trades" }, 
      (payload) => {
        const newTrade = payload.new as Trade;

        if (newTrade.pnl_usdt > 0) playTerminalSound('profit');
        else playTerminalSound('loss');

        const matchesSymbol = filterSymbol === 'ALL' || newTrade.symbol === filterSymbol;
        const matchesProfit = filterProfit === 'ALL' || 
          (filterProfit === 'PROFIT' && newTrade.pnl_usdt > 0) || 
          (filterProfit === 'LOSS' && newTrade.pnl_usdt <= 0);

        if (matchesSymbol && matchesProfit) {
          setTrades(prev => [newTrade, ...prev]);
          setTotalCount(prev => prev + 1);
        }
      }
    ).subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [filterSymbol, filterProfit]);

  const metrics = useMemo(() => {
    const wins = trades.filter(t => t.pnl_usdt > 0).length;
    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;

    const today = new Date().toISOString().split('T')[0];
    const todayPnl = trades
      .filter(t => t.exit_time.startsWith(today))
      .reduce((acc, curr) => acc + Number(curr.pnl_usdt), 0);

    return { winRate, todayPnl };
  }, [trades]);

  return { 
    trades, metrics, totalCount, isLoading, isFetchingNextPage, hasMore, loadMore,
    filterSymbol, setFilterSymbol, filterProfit, setFilterProfit
  };
}